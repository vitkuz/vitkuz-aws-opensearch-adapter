import { getAdapter, sleep, saveResponse } from './common';

const run = async () => {
    const adapter = getAdapter();
    const indexName = 'vitkuz-adapter-multi-type-test-index';

    console.log('🚀 Starting Multi-Type Integration Tests\n');

    try {
        console.log(`--- Setting up Index: ${indexName} ---`);
        const exists = await adapter.existsIndex({ index: indexName });
        if (exists) {
            await adapter.deleteIndex({ index: indexName });
            await sleep(2000);
        }
        await adapter.createIndex({ index: indexName });

        // --- Seed Data (Mixed Types) ---
        console.log('--- Seeding Mixed Data ---');
        const operations = [];

        // 1. Categories
        operations.push({
            type: 'index' as const,
            index: indexName,
            id: 'cat-1',
            body: {
                id: 'cat-1',
                type: 'category',
                name: 'Science Fiction',
                description: 'Space and future stuff',
            },
        });
        operations.push({
            type: 'index' as const,
            index: indexName,
            id: 'cat-2',
            body: {
                id: 'cat-2',
                type: 'category',
                name: 'Fantasy',
                description: 'Magic and dragons',
            },
        });

        // 2. Authors
        operations.push({
            type: 'index' as const,
            index: indexName,
            id: 'auth-1',
            body: {
                id: 'auth-1',
                type: 'author',
                name: 'Isaac Asimov',
                birth_year: 1920,
                nationality: 'American',
            },
        });
        operations.push({
            type: 'index' as const,
            index: indexName,
            id: 'auth-2',
            body: {
                id: 'auth-2',
                type: 'author',
                name: 'J.R.R. Tolkien',
                birth_year: 1892,
                nationality: 'British',
            },
        });

        // 3. Books
        operations.push({
            type: 'index' as const,
            index: indexName,
            id: 'book-1',
            body: {
                id: 'book-1',
                type: 'book',
                title: 'Foundation',
                author_id: 'auth-1',
                category_id: 'cat-1',
                pages: 255,
                published: 1951,
            },
        });
        operations.push({
            type: 'index' as const,
            index: indexName,
            id: 'book-2',
            body: {
                id: 'book-2',
                type: 'book',
                title: 'I, Robot',
                author_id: 'auth-1',
                category_id: 'cat-1',
                pages: 253,
                published: 1950,
            },
        });
        operations.push({
            type: 'index' as const,
            index: indexName,
            id: 'book-3',
            body: {
                id: 'book-3',
                type: 'book',
                title: 'The Hobbit',
                author_id: 'auth-2',
                category_id: 'cat-2',
                pages: 310,
                published: 1937,
            },
        });

        await adapter.batchWrite({
            operations: operations,
            refresh: true,
        });
        console.log(`Indexed ${operations.length} mixed items.`);

        // --- Search Tests ---

        // 1. Get ALL Books
        console.log('Testing: Search Only Books');
        const booksRes: any = await adapter.search({
            index: indexName,
            body: {
                query: {
                    term: { 'type.keyword': 'book' },
                },
            },
        });
        saveResponse('multi-type-integration', '1_all_books', booksRes);

        if (booksRes.body.hits.total.value !== 3) {
            throw new Error(`Expected 3 books, got ${booksRes.body.hits.total.value}`);
        }
        // Verify we didn't get authors
        const types = booksRes.body.hits.hits.map((h: any) => h._source.type);
        if (types.some((t: string) => t !== 'book')) {
            throw new Error('Search result contained non-book types');
        }

        // 2. Search Books by Author (Filter by type AND author_id)
        console.log('Testing: Search Books by Asimov');
        const asimovBooksRes: any = await adapter.search({
            index: indexName,
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { 'type.keyword': 'book' } },
                            { term: { 'author_id.keyword': 'auth-1' } },
                        ],
                    },
                },
            },
        });
        saveResponse('multi-type-integration', '2_asimov_books', asimovBooksRes);

        if (asimovBooksRes.body.hits.total.value !== 2) {
            throw new Error(`Expected 2 Asimov books, got ${asimovBooksRes.body.hits.total.value}`);
        }

        // 3. Search across types (e.g. Search for "Foundation" or "Fantasy")
        // Full text search works on 'name' (category/author) and 'title' (book) if we search commonly or use query_string
        console.log('Testing: Multi-field search (Searching for "Fantasy")');
        // "Fantasy" appears in Category Name
        const searchRes: any = await adapter.search({
            index: indexName,
            body: {
                query: {
                    multi_match: {
                        query: 'Fantasy',
                        fields: ['name', 'title'], // Search both 'name' (for cats/authors) and 'title' (for books)
                    },
                },
            },
        });
        saveResponse('multi-type-integration', '3_search_fantasy', searchRes);

        if (searchRes.body.hits.total.value !== 1) {
            throw new Error(`Expected 1 hit for Fantasy, got ${searchRes.body.hits.total.value}`);
        }
        if (searchRes.body.hits.hits[0]._source.type !== 'category') {
            throw new Error('Expected to find the Category document');
        }

        console.log('✅ Multi-Type Tests Passed\n');
    } catch (error) {
        console.error('\n❌ Test Failed:', error);
        process.exit(1);
    }
};

run();
