import crypto from 'crypto';

import connection from '../db/connection';
import {User} from '../db/entity/user.entity';
import {Team} from '../db/entity/team.entity';

export async function createTeam({name, username}) {

  const db = await connection();

  const userRepository = db.getRepository(User);
  const user = await userRepository.findOne({username: username});

  const teamRepository = db.getRepository(Team);
  console.log("saving...");
  const team = await teamRepository.save({
    name: name,
    user: user
  //}).catch(error => {
  //  console.log("Error on save team", error);
  //  return error;
  });
  console.log("saved");

  // TODO: create and assign team players

  return team;
}
