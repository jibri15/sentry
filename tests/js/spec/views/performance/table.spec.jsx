import {mountWithTheme} from 'sentry-test/enzyme';
import {initializeOrg} from 'sentry-test/initializeOrg';

import {t} from 'app/locale';
import ProjectsStore from 'app/stores/projectsStore';
import EventView from 'app/utils/discover/eventView';
import {
  SPAN_OP_BREAKDOWN_FIELDS,
  SPAN_OP_RELATIVE_BREAKDOWN_FIELD,
} from 'app/utils/discover/fields';
import Table from 'app/views/performance/table';

function initializeData({features: additionalFeatures = [], query = {}} = {}) {
  const features = ['discover-basic', 'performance-view', ...additionalFeatures];
  const organization = TestStubs.Organization({
    features,
    projects: [TestStubs.Project()],
    apdexThreshold: 400,
  });
  const initialData = initializeOrg({
    organization,
    router: {
      location: {
        query: {
          transaction: '/performance',
          project: 1,
          transactionCursor: '1:0:0',
          ...query,
        },
      },
    },
  });
  ProjectsStore.loadInitialData(initialData.organization.projects);
  return initialData;
}

describe('Performance GridEditable Table', function () {
  let transactionsListTitles;
  let fields;
  let organization;
  const query =
    'transaction.duration:<15m event.type:transaction transaction:/api/0/organizations/{organization_slug}/eventsv2/';
  beforeEach(function () {
    transactionsListTitles = [
      t('event id'),
      t('user'),
      t('operation duration'),
      t('total duration'),
      t('trace id'),
      t('timestamp'),
    ];
    fields = [
      'id',
      'user.display',
      SPAN_OP_RELATIVE_BREAKDOWN_FIELD,
      'transaction.duration',
      'trace',
      'timestamp',
      'spans.total.time',
      ...SPAN_OP_BREAKDOWN_FIELDS,
    ];
    organization = TestStubs.Organization();
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/projects/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/is-key-transactions/',
      body: [],
    });
    MockApiClient.addMockResponse({
      url: '/prompts-activity/',
      body: {},
    });
    MockApiClient.addMockResponse({
      url: '/organizations/org-slug/sdk-updates/',
      body: [],
    });
    MockApiClient.addMockResponse({
      method: 'GET',
      url: `/organizations/org-slug/legacy-key-transactions-count/`,
      body: [],
    });
    // Transaction list response
    MockApiClient.addMockResponse(
      {
        url: '/organizations/org-slug/eventsv2/',
        headers: {
          Link:
            '<http://localhost/api/0/organizations/org-slug/eventsv2/?cursor=2:0:0>; rel="next"; results="true"; cursor="2:0:0",' +
            '<http://localhost/api/0/organizations/org-slug/eventsv2/?cursor=1:0:0>; rel="previous"; results="false"; cursor="1:0:0"',
        },
        body: {
          meta: {
            id: 'string',
            'user.display': 'string',
            'transaction.duration': 'duration',
            'project.id': 'integer',
            timestamp: 'date',
          },
          data: [
            {
              id: 'deadbeef',
              'user.display': 'uhoh@example.com',
              'transaction.duration': 400,
              'project.id': 1,
              timestamp: '2020-05-21T15:31:18+00:00',
              trace: '1234',
            },
            {
              id: 'moredeadbeef',
              'user.display': 'moreuhoh@example.com',
              'transaction.duration': 600,
              'project.id': 1,
              timestamp: '2020-05-22T15:31:18+00:00',
              trace: '4321',
            },
          ],
        },
      },
      {
        predicate: (url, options) => {
          return (
            url.includes('eventsv2') && options.query?.field.includes('user.display')
          );
        },
      }
    );
  });

  afterEach(function () {
    MockApiClient.clearMockResponses();
    ProjectsStore.reset();
    jest.clearAllMocks();
  });

  it('renders basic UI elements when feature flagged', async function () {
    const initialData = initializeData({features: ['performance-events-page']});
    const eventView = EventView.fromNewQueryWithLocation(
      {
        id: undefined,
        version: 2,
        name: 'transactionName',
        fields,
        query,
        projects: [],
        orderby: '-timestamp',
      },
      initialData.router.location
    );
    const wrapper = mountWithTheme(
      <Table
        eventView={eventView}
        projects={[]}
        organization={organization}
        location={initialData.router.location}
        setError={this.setError}
        summaryConditions={eventView.getQueryWithAdditionalConditions()}
        columnTitles={transactionsListTitles}
      />,
      initialData.routerContext
    );
    await tick();
    wrapper.update();

    expect(wrapper.find('GridHeadCell')).toHaveLength(6);
    expect(wrapper.find('GridHeadCellStatic')).toHaveLength(0);
    expect(wrapper.find('OperationSort')).toHaveLength(1);
  });

  it('prepends key transactions column if present in the event view', async function () {
    const initialData = initializeData({features: ['performance-events-page']});
    fields.push('key_transaction');
    const eventView = EventView.fromNewQueryWithLocation(
      {
        id: undefined,
        version: 2,
        name: 'transactionName',
        fields,
        query,
        projects: [],
        orderby: '-timestamp',
      },
      initialData.router.location
    );
    const wrapper = mountWithTheme(
      <Table
        eventView={eventView}
        projects={[]}
        organization={organization}
        location={initialData.router.location}
        setError={this.setError}
        summaryConditions={eventView.getQueryWithAdditionalConditions()}
        columnTitles={transactionsListTitles}
      />,
      initialData.routerContext
    );
    await tick();
    wrapper.update();

    expect(wrapper.find('GridHeadCell')).toHaveLength(6);
    expect(wrapper.find('GridHeadCellStatic')).toHaveLength(1);
    expect(wrapper.find('OperationSort')).toHaveLength(1);
  });

  it('prepends team key transactions column if present in the event view', async function () {
    const initialData = initializeData({features: ['performance-events-page']});
    fields.push('team_key_transaction');
    const eventView = EventView.fromNewQueryWithLocation(
      {
        id: undefined,
        version: 2,
        name: 'transactionName',
        fields,
        query,
        projects: [],
        orderby: '-timestamp',
      },
      initialData.router.location
    );
    const wrapper = mountWithTheme(
      <Table
        eventView={eventView}
        projects={[]}
        organization={organization}
        location={initialData.router.location}
        setError={this.setError}
        summaryConditions={eventView.getQueryWithAdditionalConditions()}
        columnTitles={transactionsListTitles}
      />,
      initialData.routerContext
    );
    await tick();
    wrapper.update();

    expect(wrapper.find('GridHeadCell')).toHaveLength(6);
    expect(wrapper.find('GridHeadCellStatic')).toHaveLength(1);
    expect(wrapper.find('OperationSort')).toHaveLength(1);
  });
});