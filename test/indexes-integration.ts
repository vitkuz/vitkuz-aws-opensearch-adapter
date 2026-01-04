import { getAdapter, generateIndexName, sleep, saveResponse } from './common';

const run = async () => {
    const adapter = getAdapter();
    console.log('🚀 Starting Indexes Integration Tests\n');

    try {
        console.log('--- Testing Index Management (Random Index) ---');
        const randomIndex = generateIndexName();

        console.log(`Creating index: ${randomIndex}`);
        const createRes = await adapter.createIndex({ index: randomIndex });
        saveResponse('indexes-integration', '1_create_index', createRes);

        console.log('Verifying existence...');
        let exists = await adapter.existsIndex({ index: randomIndex });
        // existsIndex likely returns boolean, not a full response object we can easily convert to meaningful JSON struct for "response",
        // but let's see if we can save the boolean result wrapped
        saveResponse('indexes-integration', '2_exists_check_true', { exists });
        if (!exists) throw new Error(`Index ${randomIndex} should exist`);

        // Check mapping (update/get) on this random index
        console.log('--- Testing Mappings ---');
        const updateMappingRes = await adapter.updateMapping({
            index: randomIndex,
            body: {
                properties: {
                    title: { type: 'text' },
                    tags: { type: 'keyword' },
                },
            },
        });
        saveResponse('indexes-integration', '3_update_mapping', updateMappingRes);

        const mappingRes: any = await adapter.getMapping({ index: randomIndex });
        saveResponse('indexes-integration', '4_get_mapping', mappingRes);

        const props = mappingRes.body[randomIndex].mappings.properties;
        if (!props.title || !props.tags) {
            throw new Error(`Mapping update failed. Got: ${JSON.stringify(props)}`);
        }
        console.log('✅ Mapping Operations Passed');

        console.log('Deleting index...');
        const deleteRes = await adapter.deleteIndex({ index: randomIndex });
        saveResponse('indexes-integration', '5_delete_index', deleteRes);

        await sleep(1000);

        exists = await adapter.existsIndex({ index: randomIndex });
        saveResponse('indexes-integration', '6_exists_check_false', { exists });

        if (exists) throw new Error(`Index ${randomIndex} should NOT exist`);
        console.log('✅ Index Management Tests Passed\n');
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};

run();
