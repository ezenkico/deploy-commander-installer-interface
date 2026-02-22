import { RPCResponse, Wire } from "../types";

function getResult(response: RPCResponse){
    if(response.ok){
        return response.result;
    }
    throw response.error;
}

export function SetupRPCCaller(wire: Wire){
    async function start(
        action: string, 
        runner: string, 
        metadata: any,
        note?: string,
        platform?: string,
        platform_data?: any
    ){
        const result = await wire.sendRPC({
            request: "start",
            payload: {
                action,
                runner,
                metadata,
                note,
                platform,
                platform_data
            }
        });
        return getResult(result);
    }

    async function getRuns(
        user_id?: string,
        statuses?: string[],
        not_statuses?: string[],
        sort?: string,
        limit?: number,
        offset?: number
    ){
        const result = await wire.sendRPC({
            request: "getRuns",
            payload: {
                user_id,
                statuses,
                not_statuses,
                sort,
                limit,
                offset
            }
        });
        return getResult(result);
    }

    async function getRun(
        run_id: string
    ){
        const result = await wire.sendRPC({
            request: "getRun",
            payload: {
                run_id
            }
        });

        return getResult(result);
    }

    async function getJob(){
        const result = await wire.sendRPC({
            request: "getJob",
            payload: { }
        });

        return getResult(result);
    }

    async function getMetadata(){
        const result = await wire.sendRPC({
            request: "getMetadata",
            payload: { }
        });

        return getResult(result);
    }

    async function getResources(
        resourceType?: string,
        external?: boolean,
        job?: string,
        limit?: number,
        offset?: number
    ) {
        const result = await wire.sendRPC({
            request: "getResources",
            payload: {
                type: resourceType,
                external,
                job,
                limit,
                offset
            }
        });

        return getResult(result);
    }

    async function getMyResources(
        resourceType?: string,
        external?: boolean,
        limit?: number,
        offset?: number
    ) {
        const result = await wire.sendRPC({
            request: "getMyResources",
            payload: {
                type: resourceType,
                external,
                limit,
                offset
            }
        });

        return getResult(result);
    }

    async function getResource(
        id: string
    ) {
        const result = await wire.sendRPC({
            request: "getResource",
            payload: {
                id
            }
        });

        return getResult(result);
    }

    async function createResource(
        config: {
            medatata: any,
            name: string,
            platform_connection?: any,
            public_connection?: {
                address: string,
                port: number
            }
        },
        external: boolean,
        name: string,
        type: string
    ){
        const result = await wire.sendRPC({
            request: "createResource",
            payload: {
                config,
                external,
                name,
                type
            }
        });

        return getResult(result);
    }

    async function getConnections(
        limit?: number,
        offset?: number,
        job?: string,
        resource?: string
    ){
        const result = await wire.sendRPC({
            request: "getConnections",
            payload: {
                limit,
                offset,
                job,
                resource
            }
        });

        return getResult(result);
    }

    async function createConnection(
        config: any,
        job: string,
        external: boolean,
        resource: string
    ){
        const result = await wire.sendRPC({
            request: "createConnection",
            payload: {
                config,
                connect_job_id: job,
                external,
                resource_id: resource
            }
        });

        return getResult(result);
    }

    async function getKV(
        key: string
    ){
        const result = await wire.sendRPC({
            request: "getKV",
            payload: {
                key
            }
        });

        return getResult(result);
    }

    async function setKV(
        key: string,
        value: string
    ){
        const result = await wire.sendRPC({
            request: "setKV",
            payload: {
                key,
                value
            }
        });

        return getResult(result);
    }

    async function deleteKV(
        key: string
    ){
        const result = await wire.sendRPC({
            request: "deleteKV",
            payload: {
                key
            }
        });

        return getResult(result);
    }

    return{
        start,
        getRuns,
        getRun,
        getJob,
        getMetadata,
        getResources,
        getMyResources,
        getResource,
        createResource,
        getConnections,
        createConnection,
        getKV,
        setKV,
        deleteKV
    }
}
