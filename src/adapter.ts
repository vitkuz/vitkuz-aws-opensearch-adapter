import { Client } from '@opensearch-project/opensearch';
import { Logger, OpenSearchContext } from './types';

// Import operations directly to avoid circular dependency with index.ts
import { createIndex } from './operations/create-index';
import { getIndex } from './operations/get-index';
import { deleteIndex } from './operations/delete-index';
import { existsIndex } from './operations/exists-index';
import { getMapping } from './operations/get-mapping';
import { updateMapping } from './operations/update-mapping';
import { indexDocument } from './operations/index-document';
import { getDocument } from './operations/get-document';
import { deleteDocument } from './operations/delete-document';
import { replaceDocument } from './operations/replace-document';
import { batchWrite } from './operations/batch-write';
import { batchGet } from './operations/batch-get';
import { search } from './operations/search';

export interface AdapterConfig {
    client: Client;
    logger?: Logger;
}

export const createAdapter = (config: AdapterConfig) => {
    const context: OpenSearchContext = {
        client: config.client,
        logger: config.logger,
    };

    return {
        createIndex: createIndex(context),
        getIndex: getIndex(context),
        deleteIndex: deleteIndex(context),
        existsIndex: existsIndex(context),
        getMapping: getMapping(context),
        updateMapping: updateMapping(context),
        indexDocument: indexDocument(context),
        getDocument: getDocument(context),
        deleteDocument: deleteDocument(context),
        replaceDocument: replaceDocument(context),
        batchWrite: batchWrite(context),
        batchGet: batchGet(context),
        search: search(context),
    };
};
