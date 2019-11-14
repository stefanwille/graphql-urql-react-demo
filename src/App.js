import React, { useState, useEffect } from 'react';

import { Provider, createClient, Query, useQuery, createRequest } from 'urql';
import gql from 'graphql-tag';

import './App.css';
import { pipe, subscribe } from 'wonka';

const getAccessToken = () => 'abcdefg12345';

const client = createClient({
  url: 'http://localhost:4000/graphql',

  fetchOptions: () => {
    const accessToken = getAccessToken();
    return {
      headers: { authorization: accessToken ? `Bearer ${accessToken}` : '' },
    };
  },
});

const getMe = gql`
  query GetMe {
    me {
      firstName
      lastName
    }
  }
`;

const DeclarativeQueryForMe = () => (
  <Query query={getMe} variables={{}}>
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
  const [result] = useQuery({ query: getMe });
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

const performQuery = query => {
  return new Promise((resolve, reject) => {
    const request = createRequest(query);
    pipe(
      client.executeQuery(request),
      subscribe(({ data, error }) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      })
    );
  });
};

const ImperativeQueryForMe = () => {
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const run = async () => {
      setFetching(true);
      try {
        console.log('fetching');

        const data = await performQuery(getMe);
        console.log('data', data);
        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setFetching(false);
      }
    };
    run();
  }, []);

  if (fetching) {
    return 'Fetching...';
  }

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
    <Provider value={client}>
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
