import { ApiResponse } from '@opensearch-project/opensearch';
import { v4 as uuidv4 } from 'uuid';
import { OpenSearchContext } from '../types';

export interface IndexDocumentInput {
    index: string;
    id?: string;
    body: Record<string, any>;
    refresh?: boolean | 'wait_for';
}

export const indexDocument =
    (context: OpenSearchContext) =>
    async (input: IndexDocumentInput): Promise<ApiResponse> => {
        const { client, logger } = context;
        const { index, id, body, refresh } = input;

        const finalId = id || uuidv4();

        logger?.debug('indexDocument:start', { data: { index, id: finalId } });

        try {
            const response = await client.index({
                index,
                id: finalId,
                body,
                refresh: refresh as any, // Cast due to internal type inconsistencies in some client versions, or just strictly pass matching type
            });
            logger?.debug('indexDocument:success', { data: { index, id: response.body._id } });
            return response;
        } catch (error) {
            logger?.debug('indexDocument:error', { error });
            throw error;
        }
    };
