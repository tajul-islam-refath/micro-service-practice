const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = "../proto/calculator.proto";

// Load the protobuf
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const calculatorProto =
  grpc.loadPackageDefinition(packageDefinition).calculator;

// Implement the add function
function add(call, callback) {
  const result = call.request.number1 + call.request.number2;
  callback(null, { result });
}

function subtraction(call, callback) {
  console.log(call.request);
  const result = call.request.number1 - call.request.number2;
  callback(null, { result });
}

function multiplication(call, callback) {
  try {
    const result = call.request.number1 * call.request.number2;
    callback(null, { result });
  } catch (e) {
    console.log(e);
    callback(e, null);
  }
}

// Start the gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(calculatorProto.Calculator.service, {
    add,
    subtraction,
    multiplication,
  });
  server.bindAsync(
    "127.0.0.1:7000",
    grpc.ServerCredentials.createInsecure(),
    () => {
      console.log("gRPC server running at http://127.0.0.1:7000");
      server.start();
    }
  );
}

main();
