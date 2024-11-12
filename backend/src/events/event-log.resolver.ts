import { Resolver, Query, Args, Int, Field, InputType } from '@nestjs/graphql';
import { EventLog } from './event-log.entity';
import { EventService } from './event.service';

@InputType()
export class EventLogFilter {
  @Field({ nullable: true })
  contractAddress?: string;

  @Field({ nullable: true })
  eventName?: string;

  @Field({ nullable: true })
  signature?: string;
}
@Resolver(() => EventLog)
export class EventLogResolver {
  constructor(private readonly eventService: EventService) {}

  @Query(() => [EventLog], { name: 'eventLogs' })
  async findFiltered(
    @Args('filter', { nullable: true }) filter: EventLogFilter,
  ) {
    return this.eventService.findEventLogsWithFilter(filter);
  }

  @Query(() => EventLog, { name: 'eventLog' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.eventService.findEventLog(id);
  }
}
