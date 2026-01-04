import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface SearchInput {
    index: string;
    body: Record<string, any>;
    size?: number;
    from?: number;
}

export const search =
    (context: OpenSearchContext) =>
    async (input: SearchInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index, body, size, from } = input;

        logger?.debug('search:start', { data: { index, body: JSON.stringify(body) } });

        try {
            const response = await client.search({
                index,
                body,
                size,
                from,
            });
            const total =
                typeof response.body.hits?.total === 'number'
                    ? response.body.hits.total
                    : response.body.hits?.total?.value;
            logger?.debug('search:success', { data: { took: response.body.took, hits: total } });
            return response;
        } catch (error) {
            logger?.debug('search:error', { error });
            throw error;
        }
    };
