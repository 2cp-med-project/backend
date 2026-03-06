//Contains logic: generate token, check password
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Doctor from "../users/doctor.model.js";
import Patient from "../users/patient.model.js";
