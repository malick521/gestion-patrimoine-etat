import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

import {
  LoginResponseDTO
} from '../types';

import {
  isTokenValid
} from '../types/utils/tokenUtils';


interface AuthContextType {

  user:
  Omit<LoginResponseDTO,'token'>
  | null;


  token:string | null;


  login:
  (data:LoginResponseDTO)=>void;


  logout:()=>void;


  loading:boolean;

}



const AuthContext =
createContext<AuthContextType | undefined>(undefined);



export const AuthProvider:
React.FC<{children:React.ReactNode}> =
({children})=>{


const [user,setUser] =
useState<Omit<LoginResponseDTO,'token'>|null>(null);


const [token,setToken] =
useState<string|null>(null);


const [loading,setLoading] =
useState(true);




useEffect(()=>{


const savedToken =
localStorage.getItem("token");


const savedUser =
localStorage.getItem("user");



if(
 savedToken &&
 savedUser &&
 isTokenValid(savedToken)
){

 setToken(savedToken);

 setUser(
   JSON.parse(savedUser)
 );

}
else{

 localStorage.removeItem("token");
 localStorage.removeItem("user");

 setToken(null);
 setUser(null);

}



setLoading(false);



},[]);





const login =
(data:LoginResponseDTO)=>{


const {
 token,
 ...userData
}=data;



// save JWT

localStorage.setItem(
 "token",
 token
);



localStorage.setItem(
 "user",
 JSON.stringify(userData)
);



setToken(token);

setUser(userData);



// redirect

window.location.href="/";

};





const logout=()=>{


localStorage.removeItem("token");

localStorage.removeItem("user");


setToken(null);

setUser(null);



window.location.href="/login";

};





return (

<AuthContext.Provider

 value={{
   user,
   token,
   login,
   logout,
   loading
 }}

>


{!loading && children}


</AuthContext.Provider>


);



};





export const useAuth=()=>{


const context =
useContext(AuthContext);


if(!context){

throw new Error(
"useAuth doit être utilisé dans AuthProvider"
);

}


return context;


};
