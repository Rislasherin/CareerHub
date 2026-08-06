import { IMessageBroker } from "@application/services/IMessageBroker";
import amqp, {ChannelModel, Channel} from 'amqplib'

export class RabbitMQBroker implements IMessageBroker {
	private _connection: ChannelModel | null = null;
	private _channel: Channel | null = null;

	constructor(private readonly _connectionUrl: string){}

	async connect(): Promise<void> {
		this._connection = await amqp.connect(this._connectionUrl);
		this._channel = await this._connection.createChannel();
	}
	async publish(queue: string, payload: Record<string, unknown>): Promise<void> {
		if(!this._channel) {
			throw new Error('RabbitMQBroker: Not connected. Call connect() first.');
		}

		await this._channel.assertQueue(queue, {
			durable : true
		})
		this._channel.sendToQueue(
			queue,
			Buffer.from(JSON.stringify(payload)),
			{persistent: true}
		);
	}
}