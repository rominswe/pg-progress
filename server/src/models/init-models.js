import _sequelize from "../config/db.js";
const DataTypes = _sequelize.DataTypes;
import _empinfo from  "./empinfo.js";
import _evaluation from  "./evaluation.js";
import _masterStu from  "./masterStu.js";
import _programInfo from  "./programInfo.js";
import _progress from  "./progress.js";
import _role from  "./role.js";
import _studinfo from  "./studinfo.js";
import _supervisor from  "./Supervisor.js";
import _supervisoryMeeting from  "./supervisoryMeeting.js";
import _thesis from  "./thesis.js";

export default function initModels(sequelize) {
  const empinfo = _empinfo.init(sequelize, DataTypes);
  const evaluation = _evaluation.init(sequelize, DataTypes);
  const masterStu = _masterStu.init(sequelize, DataTypes);
  const programInfo = _programInfo.init(sequelize, DataTypes);
  const progress = _progress.init(sequelize, DataTypes);
  const role = _role.init(sequelize, DataTypes);
  const studinfo = _studinfo.init(sequelize, DataTypes);
  const supervisor = _supervisor.init(sequelize, DataTypes);
  const supervisoryMeeting = _supervisoryMeeting.init(sequelize, DataTypes);
  const thesis = _thesis.init(sequelize, DataTypes);

  masterStu.belongsTo(studinfo, { as: "stu", foreignKey: "stu_id"});
  studinfo.hasMany(masterStu, { as: "master_stus", foreignKey: "stu_id"});
  evaluation.belongsTo(thesis, { as: "thesis", foreignKey: "thesis_id"});
  thesis.hasMany(evaluation, { as: "evaluations", foreignKey: "thesis_id"});
  progress.belongsTo(thesis, { as: "thesis", foreignKey: "thesis_id"});
  thesis.hasMany(progress, { as: "progresses", foreignKey: "thesis_id"});

  return {
    empinfo,
    evaluation,
    masterStu,
    programInfo,
    progress,
    role,
    studinfo,
    supervisor,
    supervisoryMeeting,
    thesis,
  };
}
