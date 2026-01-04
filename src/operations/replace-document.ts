import { ApiResponse } from '@opensearch-project/opensearch';
import { OpenSearchContext } from '../types';

export interface ReplaceDocumentInput {
    index: string;
    id: string;
    body: Record<string, any>;
    refresh?: boolean | 'wait_for';
}

export const replaceDocument =
    (context: OpenSearchContext) =>
    async (input: ReplaceDocumentInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index, id, body, refresh } = input;

        logger?.debug('replaceDocument:start', { data: { index, id } });

        try {
            // In OpenSearch/ES, indexing with an existing ID replaces the document.
            const response = await client.index({
                index,
                id,
                body,
                refresh: refresh as any,
                op_type: 'index', // Force overwrite/index
            });
            logger?.debug('replaceDocument:success', { data: { index, id } });
            return response;
        } catch (error) {
            logger?.debug('replaceDocument:error', { error });
            throw error;
        }
    };
