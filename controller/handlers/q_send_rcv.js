import crypto from "crypto";
let q_send_rcv = async (channel, q_name, content, type, res) => {
  let q = null;
  q = await channel.assertQueue("", { exclusive: true });
  let msg = {
    content: content,
    type: type,
  };
  let id = crypto.randomBytes(4).toString("hex");
  console.log(
    `q_send_rcv - sending msg ${msg.content} of type ${msg.type} with id ${id}, waiting for processing...`
  );
  channel.sendToQueue(q_name, Buffer.from(JSON.stringify(msg)), {
    correlationId: id,
    replyTo: q.queue,
  });
  console.log("sent");

  channel.consume(q.queue, (data) => {
    console.log("consuming");
    if (data !== null && data.properties.correlationId == id) {
      let ms = JSON.parse(data.content);
      let idd = data.properties.correlationId;
      console.log(
        `q_send_rcv received answer ${JSON.stringify(ms.content)} of type ${
          ms.type
        } with id ${idd}`
      );
      channel.ack(data);
      channel.deleteQueue(q.queue);
      res.json(ms);
    }
  });
};

export default q_send_rcv;
