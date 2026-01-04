import { getAdapter, sleep, saveResponse } from './common';

const run = async () => {
    const adapter = getAdapter();
    const indexName = 'vitkuz-adapter-batch-test-index';

    console.log('🚀 Starting Batch Integration Tests\n');

    try {
        console.log(`--- Setting up Index: ${indexName} ---`);
        const exists = await adapter.existsIndex({ index: indexName });
        if (exists) {
            await adapter.deleteIndex({ index: indexName });
            await sleep(2000);
        }
        await adapter.createIndex({ index: indexName });

        // --- Batch Operations ---
        console.log('--- Testing Batch Write ---');
        const batchSize = 10;
        const operations = [];
        for (let i = 0; i < batchSize; i++) {
            operations.push({
                type: 'index' as const,
                index: indexName,
                id: `batch-${i}`,
                body: { id: `batch-${i}`, title: `Batch Item ${i}`, count: i },
            });
        }

        const batchRes: any = await adapter.batchWrite({
            operations: operations,
            refresh: true,
        });
        saveResponse('batch-integration', '1_batch_write', batchRes);

        if (batchRes.body.errors) {
            throw new Error(`Batch write reported errors: ${JSON.stringify(batchRes.body.items)}`);
        }
        if (batchRes.body.items.length !== batchSize) {
            throw new Error(
                `Batch write count mismatch. Expected ${batchSize}, got ${batchRes.body.items.length}`,
            );
        }

        // Verify one
        const sample: any = await adapter.getDocument({ index: indexName, id: 'batch-0' });
        saveResponse('batch-integration', '2_get_one_batch_item', sample);

        if (sample.body._source.title !== 'Batch Item 0') {
            throw new Error('Batch item verification failed');
        }
        if (sample.body._source.id !== 'batch-0') {
            throw new Error(`Batch item ID mismatch. Got ${sample.body._source.id}`);
        }
        console.log('✅ Batch Write Passed\n');

        // --- Testing Batch Get ---
        console.log('--- Testing Batch Get ---');
        const getIds = ['batch-0', 'batch-1', 'batch-999']; // 999 does not exist
        const batchGetRes: any = await adapter.batchGet({
            index: indexName,
            ids: getIds,
        });
        saveResponse('batch-integration', '3_batch_get', batchGetRes);

        const docs = batchGetRes.body.docs;
        if (docs.length !== 3) {
            throw new Error(`Expected 3 docs in response, got ${docs.length}`);
        }

        const foundDocs = docs.filter((d: any) => d.found);
        if (foundDocs.length !== 2) {
            throw new Error(`Expected 2 found docs, got ${foundDocs.length}`);
        }

        const missingDoc = docs.find((d: any) => !d.found);
        console.log('--- Missing Doc Structure ---');
        console.log(JSON.stringify(missingDoc, null, 2));
        console.log('---------------------------');

        if (foundDocs[0]._source.title !== 'Batch Item 0') {
            throw new Error('Batch get content verification failed');
        }
        console.log('✅ Batch Get Passed\n');

        // Clean up
        await adapter.deleteIndex({ index: indexName });
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};

run();
