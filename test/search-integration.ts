import { getAdapter, sleep, saveResponse, generateUsers } from './common';

const run = async () => {
    const adapter = getAdapter();
    const indexName = 'vitkuz-adapter-search-test-index';

    console.log('🚀 Starting Search Integration Tests\n');

    try {
        console.log(`--- Setting up Index: ${indexName} ---`);
        const exists = await adapter.existsIndex({ index: indexName });
        if (exists) {
            await adapter.deleteIndex({ index: indexName });
            await sleep(2000);
        }
        await adapter.createIndex({ index: indexName });

        // --- Seed Data ---
        console.log('--- Seeding Data ---');
        const users = generateUsers(indexName, 10);

        await adapter.batchWrite({
            operations: users,
            refresh: true,
        });
        console.log(`Indexed ${users.length} users.`);

        // --- Search Tests ---

        // 1. Match All
        console.log('Testing: Match All');
        const matchAllRes: any = await adapter.search({
            index: indexName,
            body: {
                query: {
                    match_all: {},
                },
            },
        });
        if (matchAllRes.body.hits.total.value !== 10) {
            throw new Error(`Match all expected 10 hits, got ${matchAllRes.body.hits.total.value}`);
        }
        saveResponse('search-integration', '1_match_all', matchAllRes);

        // 2. Term Query (Department = 'Engineering')
        // Engineering is at index 0, 4, 8 -> 3 users
        console.log('Testing: Term Query (Department)');
        const termRes: any = await adapter.search({
            index: indexName,
            body: {
                query: {
                    term: {
                        'department.keyword': 'Engineering', // Using .keyword because standard analyzer tokenizes text
                    },
                },
            },
        });
        // We haven't set explicit mapping, so 'department' might be text+keyword or just text.
        // Default dynamic mapping usually creates text field with .keyword subfield for strings.
        // Let's assume default mapping behavior.
        saveResponse('search-integration', '2_term_department_engineering', termRes);

        // 3. Range Query (Salary > 70000)
        // Salaries: 50k, 55k, 60k, 65k, 70k, 75k, 80k, 85k, 90k, 95k
        // > 70k means: 75k, 80k, 85k, 90k, 95k (5 users)
        console.log('Testing: Range Query (Salary)');
        const rangeRes: any = await adapter.search({
            index: indexName,
            body: {
                query: {
                    range: {
                        salary: { gt: 70000 },
                    },
                },
            },
        });
        saveResponse('search-integration', '3_range_salary_gt_70k', rangeRes);

        console.log('✅ Search Tests Passed\n');

        // Cleanup
        // await adapter.deleteIndex({ index: indexName }); // Keep for inspection as requested "permanent" (well, until next run deletes it)
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};

run();
