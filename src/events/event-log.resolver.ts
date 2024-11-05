// src/events/event-log.resolver.ts
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { EventLog } from './event-log.entity';
import { EventService } from './event.service';

@Resolver(() => EventLog)
export class EventLogResolver {
  constructor(private readonly eventService: EventService) {}

  @Query(() => [EventLog], { name: 'eventLogs' })
  findAll() {
    return this.eventService.findAll();
  }

  @Query(() => EventLog, { name: 'eventLog' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.eventService.findEventLog(id);
  }
}
