
import connection from '../db/connection';
import {User} from '../db/entity/user.entity';
import {Team} from '../db/entity/team.entity';

export async function createTeam({name, username}) {

  const db = await connection();

  const userRepository = db.getRepository(User);
  const user = await userRepository.findOne({username: username});

  const teamRepository = db.getRepository(Team);
  const team = await teamRepository.save({
    name: name,
    user: user
  });

  // TODO: create and assign team players

  return team;
}
