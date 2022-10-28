import { Test } from "@nestjs/testing";
import { StaticJsonRpcProvider } from "nestjs-ethers";

import { BlockchainService } from "../../blockchain/blockchain.service";
import { availableNetworks, Networks } from "../../blockchain/constants";
import { CauldronEntity } from "../../cauldron/dao/cauldron.entity";
import { CauldronService } from "../../cauldron/services/cauldron.service";

import { CauldronSyncTaskCreatorService } from "./cauldron-sync-task-creator.service";
import { CauldronSyncTaskService } from "./cauldron-sync-task.service";

describe("CauldronSyncTaskCreatorService", () => {
    let cauldronSyncTaskCreatorService: CauldronSyncTaskCreatorService;
    let cauldronSyncTaskService: CauldronSyncTaskService;
    let blockchainService: BlockchainService;
    let cauldronService: CauldronService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CauldronSyncTaskService, BlockchainService, CauldronService, CauldronSyncTaskCreatorService],
        })
            .overrideProvider(BlockchainService)
            .useValue({
                getProvider: jest.fn,
            })
            .overrideProvider(CauldronService)
            .useValue({
                read: jest.fn
            })
            .overrideProvider(CauldronSyncTaskService)
            .useValue({
                syncTask: jest.fn
            })
            .compile();

        cauldronSyncTaskService = moduleRef.get(CauldronSyncTaskService);
        blockchainService = moduleRef.get(BlockchainService);
        cauldronService = moduleRef.get(CauldronService);
        cauldronSyncTaskCreatorService = moduleRef.get(CauldronSyncTaskCreatorService);
    });

    describe("createTasks", () => {
        let actual$: Promise<void>;
        let getProviderMock: jest.SpyInstance<StaticJsonRpcProvider, [network: Networks]>
        let getBlockNumberMock: jest.SpyInstance;
        let readMock: jest.SpyInstance;
        let syncTaskMock: jest.SpyInstance;

        beforeEach(() => {
            getProviderMock = jest.spyOn(blockchainService, "getProvider").mockReturnValue({ getBlockNumber: jest.fn() } as unknown as StaticJsonRpcProvider);
            
            const getProviderMockImplementation = getProviderMock.getMockImplementation();
            const provider = getProviderMockImplementation(Networks.MAINNET);
            getBlockNumberMock = jest.spyOn(provider, "getBlockNumber").mockResolvedValue(1);

            readMock = jest.spyOn(cauldronService, "read").mockResolvedValue([{}] as CauldronEntity[]);
            syncTaskMock = jest.spyOn(cauldronSyncTaskService, "syncTask");

            actual$ = cauldronSyncTaskCreatorService.createTasks();
        });

        it("should return void", async () => {
            const actual = await actual$;
            expect(actual).toBeUndefined();
        });

        it("should call provider", async () => {
            await actual$;
            expect(getProviderMock).toHaveBeenCalledTimes(availableNetworks.length);
            for(const network of availableNetworks){
                expect(getProviderMock).toHaveBeenCalledWith(network);
            }            
        });

        it("should call getBlockNumber", async () => {
            await actual$;
            expect(getBlockNumberMock).toHaveBeenCalledTimes(availableNetworks.length);         
        });

        it("should call read", async () => {
            await actual$;
            expect(readMock).toHaveBeenCalledTimes(availableNetworks.length);
            for(const network of availableNetworks){
                expect(readMock).toHaveBeenCalledWith({ network });
            }            
        });

        it("should call syncTask", async () => {
            await actual$;
            expect(syncTaskMock).toHaveBeenCalledTimes(availableNetworks.length);
            for(let i = 0; i < availableNetworks.length; i++ ){
                expect(syncTaskMock).toHaveBeenCalledWith({ }, 1);
            }            
        });
    });
});