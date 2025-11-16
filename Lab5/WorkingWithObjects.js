const assignment = {
  id: 1,
  title: "NodeJS Assignment",
  description: "Create a NodeJS server with ExpressJS",
  due: "2021-10-10",
  completed: false,
  score: 0,
};
const moduleObj = {
  id: "M101",
  name: "Intro to React",
  description: "Getting started with components and props",
  course: "RS101",
};
export default function WorkingWithObjects(app) {
  const getAssignment = (req, res) => {
    res.json(assignment);
  };
  const getAssignmentTitle = (req, res) => {
    res.json(assignment.title);
  };
  const getDescription = (req, res) => {
    res.json(assignment.description);
  };
  const setAssignmentTitle = (req, res) => {
    const { newTitle } = req.params;
    assignment.title = newTitle;
    res.json(assignment);
  };
  const setScore = (req, res) => {
    const { newScore } = req.params;
    assignment.score = newScore;
    res.json(assignment);
  };
  app.get("/lab5/assignment/completed/:flag", (req, res) => {
    const raw = String(req.params.flag).toLowerCase();
    assignment.completed = raw === "true" || raw === "1" || raw === "yes";
    res.json(assignment);
  });

  app.get("/lab5/module", (req, res) => res.json(moduleObj));

  app.get("/lab5/module/name", (req, res) => res.send(moduleObj.name));

  app.get("/lab5/module/name/:newName", (req, res) => {
    moduleObj.name = req.params.newName;
    res.json(moduleObj);
  });

  app.get("/lab5/module/description/:newDesc", (req, res) => {
    moduleObj.description = req.params.newDesc;
    res.json(moduleObj);
  });

  app.get("/lab5/assignment/score/:newScore", setScore);
  app.get("/lab5/assignment/title/:newTitle", setAssignmentTitle);
  app.get("/lab5/assignment/title", getAssignmentTitle);
  app.get("/lab5/assignment", getAssignment);
  app.get("/lab5/assignment/description", getDescription);
}
