import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventParameter } from './event-parameter.entity';
import { EventLog } from './event-log.entity';
import { EventLogResolver } from './event-log.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventLog, EventParameter])],
  controllers: [EventController],
  providers: [EventService, EventLogResolver],
  exports: [EventService],
})
export class EventsModule {}
