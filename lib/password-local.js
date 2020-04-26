import Local from 'passport-local'
import { findUserForLogin } from './user'

export const localStrategy = new Local.Strategy(function(
  username,
  password,
  done
) {
  findUserForLogin({ username, password })
    .then(user => {
      done(null, user)
    })
    .catch(error => {
      done(error)
    })
})
