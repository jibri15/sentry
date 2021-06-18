import {mountWithTheme} from 'sentry-test/reactTestingLibrary';

import AvatarList from 'app/components/avatar/avatarList';

function renderComponent(avatarUsersSixUsers: AvatarList['props']['users']) {
  return mountWithTheme(<AvatarList users={avatarUsersSixUsers} />);
}

describe('AvatarList', () => {
  it('renders with user letter avatars', () => {
    const users = [
      // @ts-expect-error
      TestStubs.User({id: '1', name: 'AB'}),
      // @ts-expect-error
      TestStubs.User({id: '2', name: 'BC'}),
    ];

    const {container, queryByTestId, getByText} = renderComponent(users);
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
    expect(queryByTestId('avatarList-collapsedusers')).toBeNull();

    expect({html: () => container.innerHTML}).toSnapshot();
  });

  it('renders with collapsed avatar count if > 5 users', () => {
    const users = [
      // @ts-expect-error
      TestStubs.User({id: '1', name: 'AB'}),
      // @ts-expect-error
      TestStubs.User({id: '2', name: 'BC'}),
      // @ts-expect-error
      TestStubs.User({id: '3', name: 'CD'}),
      // @ts-expect-error
      TestStubs.User({id: '4', name: 'DE'}),
      // @ts-expect-error
      TestStubs.User({id: '5', name: 'EF'}),
      // @ts-expect-error
      TestStubs.User({id: '6', name: 'FG'}),
    ];

    const {container, getByTestId, queryByText, queryAllByText} = renderComponent(users);
    expect(queryAllByText(users[0].name.charAt(0))).toBeTruthy();
    expect(queryAllByText(users[1].name.charAt(0))).toBeTruthy();
    expect(queryAllByText(users[2].name.charAt(0))).toBeTruthy();
    expect(queryAllByText(users[3].name.charAt(0))).toBeTruthy();
    expect(queryAllByText(users[4].name.charAt(0))).toBeTruthy();
    expect(queryByText(users[5].name.charAt(0))).toBeNull();
    expect(getByTestId('avatarList-collapsedusers')).toBeTruthy();
    expect({html: () => container.innerHTML}).toSnapshot();
  });
});
