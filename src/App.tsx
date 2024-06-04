import { StrictMode } from 'react';
import { createMergeableStore, MergeableStore } from 'tinybase/debug';
import { createSessionPersister } from 'tinybase/debug/persisters/persister-browser';
import { createWsSynchronizer } from 'tinybase/debug/synchronizers/synchronizer-ws-client';
import {
  Provider,
  useCreateMergeableStore,
  useCreatePersister,
  useCreateSynchronizer,
} from 'tinybase/debug/ui-react';
import {
  SortedTableInHtmlTable,
  StoreInspector,
  ValuesInHtmlTable,
} from 'tinybase/debug/ui-react-dom';
import { Buttons } from './Buttons';

export const App = () => {
  const serverPathId = location.pathname;

  const store = useCreateMergeableStore(() => createMergeableStore());

  useCreatePersister(
    store,
    (store) =>
      createSessionPersister(
        store,
        'local://vite.demo.tinybase.org' + serverPathId
      ),
    [],
    async (persister) => {
      await persister.startAutoLoad([
        {
          pets: { '0': { name: 'fido', species: 'dog' } },
          species: {
            dog: { price: 5 },
            cat: { price: 4 },
            fish: { price: 2 },
            worm: { price: 1 },
            parrot: { price: 3 },
          },
        },
        { counter: 0 },
      ]);
      await persister.startAutoSave();
    }
  );

  useCreateSynchronizer(store, async (store: MergeableStore) => {
    const synchronizer = await createWsSynchronizer(
      store,
      new WebSocket('wss://vite.demo.tinybase.org' + serverPathId),
      1
    );
    await synchronizer.startSync();
    return synchronizer;
  });

  return (
    <StrictMode>
      <Provider store={store}>
        <p>
          To demonstrate synchronization,{' '}
          <a href={serverPathId}>open this exact URL</a> in multiple incognito
          browser windows, or even other browsers altogether.
        </p>
        <Buttons />
        <div>
          <h2>Values</h2>
          <ValuesInHtmlTable />
        </div>
        <div>
          <h2>Species Table</h2>
          <SortedTableInHtmlTable
            tableId='species'
            cellId='price'
            descending={true}
            sortOnClick={true}
            className='sortedTable'
          />
          <h2>Pets Table</h2>
          <SortedTableInHtmlTable
            tableId='pets'
            cellId='name'
            limit={5}
            sortOnClick={true}
            className='sortedTable'
            paginator={true}
          />
        </div>
        <StoreInspector />
      </Provider>
    </StrictMode>
  );
};
