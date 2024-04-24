import { StrictMode } from 'react';
import {
  createMergeableStore,
  MergeableStore,
  Synchronizer,
} from 'tinybase/debug';
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
  const store = useCreateMergeableStore(() =>
    createMergeableStore('' + Math.random())
  );

  useCreatePersister(
    store,
    (store) => createSessionPersister(store, 's'),
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

  useCreateSynchronizer(
    store,
    async (store: MergeableStore) =>
      await createWsSynchronizer(
        store,
        new WebSocket('ws://demo-tinybase-org.fly.dev' + location.pathname),
        1
      ),
    [],
    async (synchronizer: Synchronizer) => {
      await synchronizer.startSync();
    }
  );

  return (
    <StrictMode>
      <Provider store={store}>
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
