import { apiClientMock, eventBusMock } from '@tests/mocks/utils';

export type MockApiClient = typeof apiClientMock;
export type MockEventBus = typeof eventBusMock;

export { apiClientMock, eventBusMock }; 