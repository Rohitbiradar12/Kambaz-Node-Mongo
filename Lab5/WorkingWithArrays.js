let todos = [
  { id: 1, title: "Task 1", completed: false, description: "" },
  { id: 2, title: "Task 2", completed: true,  description: "" },
  { id: 3, title: "Task 3", completed: false, description: "" },
  { id: 4, title: "Task 4", completed: true,  description: "" },
];

export default function WorkingWithArrays(app) {

  const getTodos = (req, res) => {
    const { completed } = req.query;
    if (completed !== undefined) {
      const completedBool = completed === "true";
      return res.json(todos.filter((t) => t.completed === completedBool));
    }
    res.json(todos);
  };


  const createNewTodo = (req, res) => {
    const newTodo = {
      id: Date.now(),
      title: "New Task",
      completed: false,
      description: "",
    };
    todos.push(newTodo);
    res.json(todos);
  };
   const postNewTodo = (req, res) => {
    const newTodo = { ...req.body, id: new Date().getTime() };
    todos.push(newTodo);
    res.json(newTodo);
  };



  const removeTodo = (req, res) => {
    const { id } = req.params;
    const idx = todos.findIndex((t) => t.id === parseInt(id));
    if (idx < 0) return res.status(404).send("Todo not found");
    todos.splice(idx, 1);
    res.json(todos);
  };
   const deleteTodo = (req, res) => {
    const { id } = req.params;
    const todoIndex = todos.findIndex((t) => t.id === parseInt(id));
     if (todoIndex === -1) {
      res.status(404).json({ message: `Unable to delete Todo with ID ${id}` });
      return;
    }
    todos.splice(todoIndex, 1);
    res.sendStatus(200);
  };



  const updateTodoTitle = (req, res) => {
    const { id } = req.params;
    const todoIndex = todos.findIndex((t) => t.id === parseInt(id));
    if (todoIndex === -1) {
      res.status(404).json({ message: `Unable to update Todo with ID ${id}` });
      return;
    }
    const title = decodeURIComponent(req.params.title);
    const todo = todos.find((t) => t.id === parseInt(id));
    if (!todo) return res.status(404).send("Todo not found");
    todo.title = title;
    res.json(todos);
  };
   const updateTodo = (req, res) => {
    const { id } = req.params;
    todos = todos.map((t) => {
      if (t.id === parseInt(id)) {
        return { ...t, ...req.body };
      }
      return t;
    });
    res.sendStatus(200);
  };



  const getTodoById = (req, res) => {
    const { id } = req.params;
    const todo = todos.find((t) => t.id === parseInt(id));
    if (!todo) return res.status(404).send("Todo not found");
    res.json(todo);
  };


  const updateTodoCompleted = (req, res) => {
    const { id, completed } = req.params;
    const todo = todos.find((t) => t.id === parseInt(id));
    if (!todo) return res.status(404).send("Todo not found");
    todo.completed = completed === "true" || completed === "1";
    res.json(todos);
  };


  const updateTodoDescription = (req, res) => {
    const { id } = req.params;
    const description = decodeURIComponent(req.params.description || "");
    const todo = todos.find((t) => t.id === parseInt(id));
    if (!todo) return res.status(404).send("Todo not found");
    todo.description = description;
    res.json(todos);
  };


  app.put("/lab5/todos/:id", updateTodo);
  app.delete("/lab5/todos/:id", deleteTodo);
  app.post("/lab5/todos", postNewTodo);
  app.get("/lab5/todos/:id/title/:title", updateTodoTitle);
  app.get("/lab5/todos/:id/delete", removeTodo);
  app.get("/lab5/todos/create", createNewTodo);
  app.get("/lab5/todos", getTodos);
  app.get("/lab5/todos/:id", getTodoById);

  app.get("/lab5/todos/:id/completed/:completed", updateTodoCompleted);
  app.get("/lab5/todos/:id/description/:description", updateTodoDescription);
}
