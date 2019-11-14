import React, { useState, useEffect } from 'react';

import { Provider, createClient, Query, useQuery } from 'urql';
import gql from 'graphql-tag';

import './App.css';

const urqlClient = createClient({
  url: 'http://localhost:4000/graphql',

  fetchOptions: () => {
    const accessToken = getAccessToken();
    return {
      headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' },
    };
  },
});

const getAccessToken = () => 'abcdefg12345';

const query = gql`
  query GetMe {
    me {
      firstName
      lastName
    }
  }
`;

const queryVariables = {};

const DeclarativeQueryForMe = () => (
  <Query query={query} variables={{}}>
    {({ fetching, data, error, extensions }) => {
      if (fetching) {
        return 'Loading...';
      } else if (error) {
        return 'Oh no!';
      }
      return (
        <p>
          Declarative query via &lt;Query&gt;: {data.me.firstName}{' '}
          {data.me.lastName}
        </p>
      );
    }}
  </Query>
);

const HookQueryForMe = () => {
  const [result] = useQuery({ query: query });
  const { fetching, error, data } = result;

  if (fetching) {
    return 'Fetching...';
  }
  if (error) {
    return 'Error...';
  }

  return (
    <p>
      Declarative query via useQuery(): {data.me.firstName} {data.me.lastName}
    </p>
  );
};

const ImperativeQueryForMe = () => {
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const run = async () => {
      const response = await urqlClient
        .query(query, queryVariables)
        .toPromise();
      setResponse(response);
    };
    run();
  }, []);

  if (!response) {
    return 'Fetching...';
  }

  const { data, error } = response;

  if (error) {
    return 'Error...';
  }

  if (!data) {
    return 'No data';
  }

  return (
    <p>
      Imperative query via client.executeQuery(): {data.me.firstName}{' '}
      {data.me.lastName}
    </p>
  );
};

function App() {
  return (
    <Provider value={urqlClient}>
      <div className="App">
        <header className="App-header">
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <DeclarativeQueryForMe />
          <HookQueryForMe />
          <ImperativeQueryForMe />
        </header>
      </div>
    </Provider>
  );
}

export default App;
