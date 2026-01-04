import { getAdapter, sleep, saveResponse } from './common';

const run = async () => {
    const adapter = getAdapter();
    const indexName = 'vitkuz-adapter-crud-test-index';
    const docId = 'crud-doc-1';

    console.log('🚀 Starting CRUD Integration Tests\n');

    try {
        console.log(`--- Setting up Index: ${indexName} ---`);
        const exists = await adapter.existsIndex({ index: indexName });
        if (exists) {
            await adapter.deleteIndex({ index: indexName });
            await sleep(2000);
        }
        await adapter.createIndex({ index: indexName });

        // --- Document CRUD ---
        console.log('--- Testing Document CRUD ---');

        // Create
        console.log('Indexing document...');
        const doc = { id: docId, title: 'Integration Test', tags: ['v1'], count: 1 };
        const indexRes = await adapter.indexDocument({
            index: indexName,
            id: docId,
            body: doc,
            refresh: true,
        });
        saveResponse('crud-integration', '1_index_document', indexRes);

        // Read
        console.log('Getting document...');
        let fetched: any = await adapter.getDocument({ index: indexName, id: docId });
        saveResponse('crud-integration', '2_get_document_after_index', fetched);

        if (fetched.body._source.title !== 'Integration Test') {
            throw new Error(`Data mismatch on create. Got: ${fetched.body._source.title}`);
        }
        if (fetched.body._source.id !== docId) {
            throw new Error(`ID mismatch on create. Got: ${fetched.body._source.id}`);
        }

        if (fetched.body._source.id !== docId) {
            throw new Error(`ID mismatch on create. Got: ${fetched.body._source.id}`);
        }

        // Overwrite (Index with same ID)
        console.log('Indexing same ID again (Overwrite)...');
        const overwriteDoc = {
            id: docId,
            title: 'Overwritten Title',
            tags: ['v1-overwrite'],
            count: 1,
        };
        const overwriteRes = await adapter.indexDocument({
            index: indexName,
            id: docId,
            body: overwriteDoc,
            refresh: true,
        });
        saveResponse('crud-integration', '2b_index_overwrite', overwriteRes);

        let fetchedOverwrite: any = await adapter.getDocument({ index: indexName, id: docId });
        if (fetchedOverwrite.body._source.title !== 'Overwritten Title') {
            throw new Error('Index overwrite failed');
        }

        // Replace (Update) - continue usage of replaceDocument for clarity
        console.log('Replacing document...');
        const newDoc = { id: docId, title: 'Updated Title', tags: ['v2'], count: 2 };
        const replaceRes = await adapter.replaceDocument({
            index: indexName,
            id: docId,
            body: newDoc,
            refresh: true,
        });
        saveResponse('crud-integration', '3_replace_document', replaceRes);

        fetched = await adapter.getDocument({ index: indexName, id: docId });
        saveResponse('crud-integration', '4_get_document_after_replace', fetched);

        if (fetched.body._source.title !== 'Updated Title') {
            throw new Error(`Data mismatch on replace. Got: ${fetched.body._source.title}`);
        }

        // Delete
        console.log('Deleting document...');
        const deleteRes = await adapter.deleteDocument({
            index: indexName,
            id: docId,
            refresh: true,
        });
        saveResponse('crud-integration', '5_delete_document', deleteRes);

        try {
            await adapter.getDocument({ index: indexName, id: docId });
            throw new Error('Document should be deleted (expected 404)');
        } catch (e: any) {
            if (e.meta && e.meta.statusCode === 404) {
                console.log('Document not found (as expected).');
                // We can't easily save the error response itself without strict typing or parsing,
                // but usually the 'e' object contains the response in e.meta or e.body if using the client directly.
                // For now we just log it.
            } else {
                throw e;
            }
        }
        console.log('✅ Document CRUD Tests Passed\n');

        // Clean up
        await adapter.deleteIndex({ index: indexName });
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};

run();
