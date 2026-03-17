/**
 * Jest mock for @nestjs/axios.
 * Provides HttpModule and HttpService for E2E/integration tests that load the full app.
 */
import { Module } from '@nestjs/common';
import { of } from 'rxjs';

export class HttpService {
  post = jest.fn().mockReturnValue(of({ data: {}, status: 200 }));
  get = jest.fn().mockReturnValue(of({ data: {}, status: 200 }));
}

@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
