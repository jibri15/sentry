import {loadFixtures} from 'sentry-test/loadFixtures';

import {
  ParseResult,
  parseSearch,
  Token,
  TokenResult,
} from 'app/components/searchSyntax/parser';
import {treeTransformer} from 'app/components/searchSyntax/utils';

type TestCase = {
  /**
   * The search query string under parsing test
   */
  query: string;
  /**
   * The expected result for the query
   */
  result: ParseResult;
  /**
   * This is set when the query is expected to completely fail to parse.
   */
  raisesError?: boolean;
};

/**
 * Normalize results to match the json test cases
 */
const normalizeResult = (tokens: TokenResult<Token>[]) =>
  treeTransformer(tokens, token => {
    // XXX: This attempts to keep the test data simple, only including keys
    // that are really needed to validate functionality.

    // @ts-ignore
    delete token.location;
    // @ts-ignore
    delete token.text;
    // @ts-ignore
    delete token.config;

    if (token.type === Token.Filter && token.invalid === null) {
      // @ts-ignore
      delete token.invalid;
    }

    if (token.type === Token.ValueIso8601Date) {
      // Date values are represented as ISO strings in the test case json
      return {...token, value: token.value.toISOString()};
    }

    return token;
  });

describe('searchSyntax/parser', function () {
  const testData: Record<string, TestCase[]> = loadFixtures('search-syntax');

  const registerTestCase = (testCase: TestCase) =>
    it(`handles ${testCase.query}`, () => {
      const resolveResult = () => parseSearch(testCase.query);

      // Handle errors
      if (testCase.raisesError) {
        expect(resolveResult).toThrow();
        return;
      }

      // Common case
      const result = resolveResult();
      expect(normalizeResult(result)).toEqual(testCase.result);
    });

  Object.entries(testData).map(([name, cases]) =>
    describe(`${name}`, () => {
      cases.map(registerTestCase);
    })
  );
});
