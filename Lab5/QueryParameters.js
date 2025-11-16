export default function QueryParameters(app) {
  const calculator = (req, res) => {
    const { a = "0", b = "0", operation = "" } = req.query;


    const A = Number(a);
    const B = Number(b);

    let result;

    switch (operation) {
      case "add":
        result = A + B;
        break;
      case "subtract":
        result = A - B;
        break;
      case "multiply":
        result = A * B;
        break;
      case "divide":
        result = B === 0 ? "Division by zero" : A / B;
        break;
      default:
        result = "Invalid operation";
    }


    res.send(String(result));
  };


  app.get("/lab5/calculator", calculator);
}
