import {gql} from 'apollo-boost';




const getMessages = gql`
  query getMessages{
      getMessages{
          id
          chat
          body
          timestamp
          from{
              id
              fname
              lname
          }
      }
  }
  `   

  const getUserProfiles = gql`
  query getUserProfiles{
      getUserProfiles{
          id
          fname
          lname
          dob
          occupation
          bio
          gender

      }
  }`


const addProfile = gql`
mutation addProfile($fname: String!, $lname: String!, $phno: String!, $email: String!, $dob: Date!, $occupation: String!, $bio: String!, $gender: String!, $images: {Int!, Upload!}){
    createPerson(fname: $name, lname: $lname, phno: $phno, email: $email, dob: $dob ) {
        id
        fname
        lname
        phno
        email
        dob
        occupation
        bio
        gender
        images{
            order
            image
        }

    }
}`

const sendChat = gql`
mutation sendChat($timestamp: Date!, $from: User!, $chat: String!,$body: String!, $properties:(String!, String!), $attachments: (String!,String!,String!,String!)){
    sendChat(timestamp: $timestamp, from: $from, chat: $chat, body: $body, properties: $properties){
        id
        timestamp
        chat
        from{
            id
            fname
            lname
        }
        properties{
            key
            value
        }
        attachments{
            type
            source
            properties{
                key
                value
            }
        }
    }
}`

const chatSentSubscription = gql`
 subscription{
    Chat(filter: {
        mutation_in: [CREATED]
    }){
        id
        body
        timestamp
        from{
            id
            name
        }
    }
 }`;

 const user = gql`
   query{
       User{
           id
           fname
           lname
           phno
           email
           dob
       }
   }`

   const profile = gql`{
       query{
           Profile{
               id
               fname
               lname
               dob
               occupation
               bio
               gender
           }
       }
   }`

