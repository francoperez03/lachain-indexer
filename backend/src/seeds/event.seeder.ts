import { DataSource } from 'typeorm';
import { Contract } from '../contracts/contract.entity';
import { Event } from '../events/event.entity';
import { EventLog } from '../events/event-log.entity';
import { EventParameter } from '../events/event-parameter.entity';
import { EventLogParameter } from '../events/event-log-parameter.entity';
import { Transaction } from '../transactions/transaction.entity';

export async function seedEvents(
  dataSource: DataSource,
  contracts: Contract[],
  transactions: Transaction[],
) {
  const eventRepository = dataSource.getRepository(Event);
  const eventLogRepository = dataSource.getRepository(EventLog);
  const eventParameterRepository = dataSource.getRepository(EventParameter);
  const eventLogParameterRepository =
    dataSource.getRepository(EventLogParameter);

  const eventsData = [
    {
      fragment: {
        type: 'event',
        inputs: [
          { name: 'cToken', type: 'address' },
          { name: 'account', type: 'address' },
        ],
      },
      name: 'MarketExited',
      signature: 'MarketExited(address,address)',
      topic:
        '0xe699a64c18b07ac5b7301aa273f36a2287239eb9501d81950672794afba29a0d',
      args: [
        '0x465ebFCeB3953e2922B686F2B4006173664D16cE',
        '0x0A6EADa0d955951CFCFc1fcf4a295d4E72e0BC67',
      ],
      transactionHash: transactions[0].hash,
      blockNumber: transactions[0].blockNumber,
      logIndex: 0,
      address: contracts[0].address,
    },
  ];

  for (const eventData of eventsData) {
    // Encontrar el contrato asociado
    const contract = contracts.find(
      (c) => c.address.toLowerCase() === eventData.address.toLowerCase(),
    );

    let event = await eventRepository.findOne({
      where: { name: eventData.name, contract: { id: contract.id } },
      relations: ['contract', 'eventParameters'],
    });

    if (!event) {
      event = eventRepository.create({
        name: eventData.name,
        signature: eventData.signature,
        contract: contract,
        eventParameters: [],
      });

      // Crear EventParameters desde los inputs del fragmento
      for (const input of eventData.fragment.inputs) {
        const eventParameter = eventParameterRepository.create({
          name: input.name,
          type: input.type,
          event: event,
        });
        event.eventParameters.push(eventParameter);
      }

      await eventRepository.save(event);
    }

    const eventLog = eventLogRepository.create({
      event: event,
      blockNumber: eventData.blockNumber,
      logIndex: eventData.logIndex,
    });
    await eventLogRepository.save(eventLog);

    // Crear los EventLogParameters
    for (let i = 0; i < eventData.args.length; i++) {
      const paramValue = eventData.args[i];
      const paramName = eventData.fragment.inputs[i].name;

      // Buscar el EventParameter asociado por nombre
      const eventParameter = event.eventParameters.find(
        (param) => param.name === paramName,
      );

      if (eventParameter) {
        const eventLogParameter = eventLogParameterRepository.create({
          value: paramValue.toString(),
          eventLog: eventLog,
          eventParameter: eventParameter,
        });
        await eventLogParameterRepository.save(eventLogParameter);
      }
    }
  }

  console.log('Events seeded successfully!');
}
