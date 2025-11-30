import ModulesDao from "./dao.js";

export default function ModulesRoutes(app) {
  const dao = ModulesDao();

  const findModulesForCourse = async (req, res) => {
    const { courseId } = req.params;
    const modules = await dao.findModulesForCourse(courseId);
    res.json(modules);            
  };

  const createModuleForCourse = async (req, res) => {
    const { courseId } = req.params;
    const module = { ...req.body};
    const newModule = await dao.createModule(courseId,module);
    res.status(201).json(newModule);
  };

  const deleteModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const result = await dao.deleteModule(courseId, moduleId);
    res.json(result);
  };

  const updateModule = async (req, res) => {
    const { moduleId } = req.params;
    const moduleUpdates = req.body;
    const updated = await dao.updateModule(moduleId, moduleUpdates);
    if (!updated) {
      return res.sendStatus(404);
    }
    res.json(updated);
  };

  app.get("/api/courses/:courseId/modules", findModulesForCourse);
  app.post("/api/courses/:courseId/modules", createModuleForCourse);
  app.delete("/api/courses/:courseId/modules/:moduleId", deleteModule);
  app.put("/api/courses/:courseId/modules/:moduleId", updateModule);
}
