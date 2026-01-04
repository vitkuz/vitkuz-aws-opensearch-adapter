import { OpenSearchContext } from '../types';

export interface ExistsIndexInput {
    index: string;
}

export const existsIndex =
    (context: OpenSearchContext) =>
    async (input: ExistsIndexInput): Promise<boolean> => {
        const { client, logger } = context;
        const { index } = input;

        logger?.debug('existsIndex:start', { data: { index } });

        try {
            const response = await client.indices.exists({
                index,
            });
            logger?.debug('existsIndex:success', { data: { index, exists: response.body } });
            return response.body as boolean;
        } catch (error) {
            logger?.debug('existsIndex:error', { error });
            throw error;
        }
    };
