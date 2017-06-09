**Trivia REST Service**

By Alexis Fraga, Jason Krein, & Jake Pickett

**Overview**

The Trivia REST Service (TRS) provides the interface needed to interact with a site that tracks users, trivia questions, and answers to these questions. Users would select a category that they’re interested in, and be presented with all of the questions that fit that category. After a user answers a question correctly, the server keeps track of that, and adds some points to their profile, and that answer shows up in the "answered" tab of the webpage. In addition to answering questions, users will be able to submit and edit their own questions.

**General Points**

The following design points apply across the document.

1. All resource URLs are prefixed by some root URL, (e.g. http://www.softwareinventions.com/TRS/)

2. All resources accept and provide only JSON body content. And per REST standards, all successful (200 code) DELETE actions return empty body.

3. Some GET operations allow get-parameters. These are listed directly after the GET word. All get-parameters are optional unless given in bold.

4. Absent documentation to the contrary, all DELETE calls, POST, and PUT calls with a non-200 HTTP response return as their body content, a list of JSON objects describing any errors that occurred. Error objects are of form {tag: {errorTag}, params: {params}} where errorTag is a string tag identifying the error, and params is a possibly-empty array of additional values needed to fill in details about the error. E.g. {tag: "missingField", params: ["lastName"]}

5. Resource documentation lists possible errors only when the error is not obvious from this General Points section. Relevant errors may appear in any order in the body. Missing field errors are checked first, and no further errors are reported if missing fields are found.

6. All resource-creating POST calls return the newly created resource as a URI via the Location response header, not in the response body. The response body for such POSTs is reserved for error information, per point 4.

7. GET calls return one of the following. Response body is empty in the latter two cases. Get calls whose specified information is a list always return an array, even if it has just one or even zero elements.

    1. HTTP code OK and the specified information in the body.

    2. BAD_REQUEST and a list of error strings.

    3. UNAUTHORIZED for missing login.

    4. FORBIDDEN for insufficient authorization despite login

    5. NOT_FOUND for a URI that is not described in the REST spec if logged in, 401 if not.

8. Fields of JSON content for POST and PUT calls are assumed to be strings, booleans, ints, or doubles without further documentation where obvious by their name or intent. In non-obvious cases, the docs give the type explicitly.

9. All access requires authentication via login to establish the Authenticated User (AU); no resources are public except for Prss/POST (for initial registration), and Ssns/POST (to log in). Other resources may be restricted based on admin status of AU. The default restriction is to allow only access relevant to the AU, unless the AU is admin, in which case access to any Person's info is allowed.

10. Any database query failure constitutes a server error (status 500) with a body giving the error object returned from the query. Ideally, no request, however badly framed, should result in such an error except as described in point 11

11. The REST interface does no general checking for forbiddenField errors, unless the spec specifically indicates it will. Absent such checking, non-specified body fields in PUT/POST calls may result in database query errors and a 500 code.

12. All timestamps are to 1 second resolution.

**Error Codes**

The possible error codes, and any parameters, are as follows.

*missingField *Field missing from request. Params[0] gives field name

*badValue* Field has bad value. Params[0] gives field name

*notFound* Entity not present in DB -- for cases where a Conversation, Person, etc. is not there.

*badLogin* Email/password combination invalid, for errors logging.

*dupEmail* Email duplicates an existing email

*noTerms* Acceptance of terms is required

*forbiddenRole* Role specified is not permitted.

*noOldPwd* Change of password requires an old password

*oldPwdMismatch* Old password that was provided is incorrect.

*dupTitle* Conversation title duplicates an existing one

*dupEnrollment* Duplicate enrollment

*forbiddenField* Field in body not allowed. Params[0] gives field name.

*queryFailed* Query failed (server problem)

**Resources for User Management, including Registration**

**(Admin use in purple)**

**Prss**

Collection of all current students or other users.

**_GET_** email={email or email prefix}

Returns list of zero or more Persons. Limits response to Persons with specified email or email prefix, if applicable. No data for other than the AU is returned in any event, unless the AU is an admin. This may result in an empty list if e.g. a non-admin asks for an email not their own. Data per person:

*email *principal string identifier, unique across all Persons

*points *Number of points this person has

*id *id of person with said email, so that URI would be Prss/{id}

**_POST_**

Adds a new Person. No AU required, as this resource/verb is used for registration, but an AU is allowed, and an admin AU gets special treatment as indicated.

*email* unique Email for new person

*firstName*

*lastName*

*password*

*role* 0 for student, 1 for admin

*termsAccepted* boolean--were site terms and conditions accepted?

Email and lastName required and must be nonempty. Error if email is nonunique. Error if terms were not accepted and AU is not admin. Error forbiddenRole if role is not student unless AU is admin. Nonempty password required unless AU is admin, in which case if no password is provided a blocking password is recorded, preventing further access to the account.

**Prss/{prsId}**

**_GET_**

Returns object for Person {prsId}, with fields as specified in POST for Prss, plus dates *termsAccepted*, *whenRegistered *and *points*, less *password*. The dates give time of term acceptance and registration, and will generally be equal, but are listed separately for legal reasons. AU must be person {prsId} or admin.

**_PUT_**

Update Person {prsId}, with body giving an object with one or more of *firstName*, *lastName*, *password*, *role. *Attempt to change other fields in Person such as *termsAccepted* or *whenRegistered* results in BAD_REQUEST and forbiddenField error(s). Role changes result in BAD_REQUEST with badValue tag for nonadmins. All changes require the AU be the Person in question, or an admin. Unless AU is admin, an additional field *oldPassword* is required for changing *password*.

**_DELETE_**

Delete the Person in question, including all Cnvs and Msgs owned by Person. Requires admin AU.

**Ssns**

Login sessions (Ssns) establish an AU and are required for most service access. A user obtains one via POST to Ssns.

**_GET_**

Returns a list of all active sessions. Admin-privileged AU required. Returns array of

*cookie* Unique cookie value for session

*prsId* ID of Person logged in

*loginTime* Date and time of login

**_POST_**

A successful POST generates a browser-session cookie that will permit continued access for 2 hours. Indicated Person becomes the AU. An unsuccessful POST results in a 400 with a badLogin tag and no further information.	

*email* Email of user requesting login

*password* Password of user

**Ssns/{cookie}**

**_GET_**

Returns, for the indicated session, a single object with same properties as one element of the array returned from Ssns GET. AU must be admin or owner of session.

**_DELETE_**

Log out the specified Session. AU must be owner of Session or admin.

**Resources for Questions and Categories**

The following resources allow creation, deletion, and management of Questions. When checking if a guess is correct, a user POSTs Qsts/{qstId} which updates the user’s points if correct. To check if the user got the question correct, they call GET Qsts/correct/{qstId}.

**Qsts**

**_GET _**owner=<id> 

Any AU is acceptable. Return an array of 0 or more elements, with one element for each Question  in the system, limited to Questions with the specified owner if query param is given. If param is not given, returns Questions owned by the AU:

*id* Id of the Question

*title* Title of the Question

*ownerId* Owner of the Question

*categoryTitle *Category of the Question

*answer * Answer to the Question (only if AU is owner or admin)

**_POST_**

Create a new Question, owned by the current AU. Error dupTitle if title is a duplicate. If category doesn’t exist, a badValue error will be returned. Fields are

*title* Title of the new Question, limited to 500 chars

*categoryId *Category of the new Question

*answer *Answer to the Question, limited to 100 chars

**Qsts/Correct**

**_GET _**

Returns all questions that have been correctly answered by the current AU. Return an array of 0 or more elements:

*id* Id of the Question

*title* Title of the Question

*ownerId* Owner of the Question

*categoryTitle *Category of the Question

*answer * Answer to the Question

**Qsts/Correct/{qstId}**

**_GET _**

Returns whether or not AU has gotten the question with the specified ID correct:

*correct *True or false

**Qsts/{QstId}**

**	****_PUT _**

Update the title, answer or category of the question.  If category doesn’t exist, a badValue error will be returned. AU must be Question owner or admin.

	*title *The new question title, limited to 500 chars 

*	answer *The new question answer, limited to 100 chars

*	categoryId *The new category of the question

**_DELETE_**

Delete the specified question. AU must be Question owner or admin.

**Qsts/{QstId}/Answers**

**	****_POST_**

Submit a guess for the specified question with the field. Points will be added to the AU’s profile if the guess is correct.

	*guess *What the AU thinks the answer is. 

**Ctgs**

**_GET _**

Any AU is acceptable. Return an array of 0 or more elements, with one element for each Category in the system:

*id* Id of the Category

*title* Title of the Category

**_POST_**

Create a new Category. Error dupTitle if title is a duplicate. Fields are

*title* Title of the new Category, limited to 80 chars

**Ctgs/{ctgId}**

**	**Returns all unanswered questions from the specified category

**_GET_**

Any AU is acceptable. Return an array of 0 or more elements of questions under the category that AU has not answered correctly:

*id* Id of the Question

*title* Title of the Question

*ownerId* Owner of the Question

*categoryTitle *Category of the Question

**_DELETE_**

Delete the specified category. Every question in the category will be deleted as well. AU must an admin.

**Special DB Resource for Testing Purposes**

**DB**

**_DELETE_**

Clear all content from the database, reset all autoincrement IDs to 1, and add back one Person, an admin named Joe Admin with email adm@11.com and password "password". Clear all current sessions. AU must be an admin.

