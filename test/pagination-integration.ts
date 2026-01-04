import { getAdapter, sleep, saveResponse, generateUsers } from './common';

const run = async () => {
    const adapter = getAdapter();
    const indexName = 'vitkuz-adapter-pagination-test-index';

    console.log('🚀 Starting Pagination Integration Tests\n');

    try {
        console.log(`--- Setting up Index: ${indexName} ---`);
        const exists = await adapter.existsIndex({ index: indexName });
        if (exists) {
            await adapter.deleteIndex({ index: indexName });
            await sleep(2000);
        }
        await adapter.createIndex({ index: indexName });

        // --- Seed Data ---
        console.log('--- Seeding Data (25 users) ---');
        // Generate 25 users to test pages of size 10 (10 + 10 + 5)
        const users = generateUsers(indexName, 25);
        await adapter.batchWrite({
            operations: users,
            refresh: true, // Important for immediate search
        });
        console.log(`Indexed ${users.length} users.`);

        // --- Pagination Tests ---

        // Page 1: Size 10, From 0
        console.log('Testing: Pagination Page 1 (0-10)');
        const page1Res: any = await adapter.search({
            index: indexName,
            size: 10,
            from: 0,
            body: {
                query: { match_all: {} },
                sort: [{ 'id.keyword': 'asc' }], // Sort is crucial for consistent pagination
            },
        });
        saveResponse('pagination-integration', '1_page_1', page1Res);

        const hits1 = page1Res.body.hits.hits;
        if (hits1.length !== 10) throw new Error(`Page 1 expected 10 hits, got ${hits1.length}`);
        if (hits1[0]._source.id !== 'user-0')
            throw new Error(`Page 1 first item should be user-0, got ${hits1[0]._source.id}`);

        // Page 2: Size 10, From 10
        console.log('Testing: Pagination Page 2 (10-20)');
        const page2Res: any = await adapter.search({
            index: indexName,
            size: 10,
            from: 10,
            body: {
                query: { match_all: {} },
                sort: [{ 'id.keyword': 'asc' }],
            },
        });
        saveResponse('pagination-integration', '2_page_2', page2Res);

        const hits2 = page2Res.body.hits.hits;
        if (hits2.length !== 10) throw new Error(`Page 2 expected 10 hits, got ${hits2.length}`);
        // user-0 to user-9 are on page 1.
        // user-10 should be first on page 2.
        // Wait, string sort 'user-0', 'user-1', 'user-10', 'user-11'...
        // Lexicographical sort might be tricky. 'user-0', 'user-1', 'user-10', 'user-11' ... 'user-19', 'user-2'
        // Let's check the first item to see what we got, but verifying count is most important.
        console.log(`Page 2 first item: ${hits2[0]._source.id}`);

        // Page 3: Size 10, From 20 (Should have 5 items)
        console.log('Testing: Pagination Page 3 (20-25)');
        const page3Res: any = await adapter.search({
            index: indexName,
            size: 10,
            from: 20,
            body: {
                query: { match_all: {} },
                sort: [{ 'id.keyword': 'asc' }],
            },
        });
        saveResponse('pagination-integration', '3_page_3', page3Res);

        const hits3 = page3Res.body.hits.hits;
        if (hits3.length !== 5) throw new Error(`Page 3 expected 5 hits, got ${hits3.length}`);
        console.log(`Page 3 first item: ${hits3[0]._source.id}`);

        console.log('✅ Pagination Tests Passed\n');
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};

run();
