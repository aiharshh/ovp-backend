# This is a robust backend for youtube with javascript

-[Model Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)

 

 A. req.params (The Address in the URL)
Where does it come from? The URL path itself.
When is it used? When you use a colon : in your route!
Route: /videos/:videoId
URL sent by Postman: /videos/65a123bc
Express creates: req.params = { videoId: "65a123bc" }
Use case: Identifying a specific single thing (e.g. deleteVideo, getVideoById).


B. req.query (The Search & Filter Controls)
Where does it come from? After a question mark ? in the URL.
When is it used? Searching, sorting, pagination.
URL sent: /videos?page=1&limit=10&query=javascript
Express creates: req.query = { page: "1", limit: "10", query: "javascript" }
Use case: getAllVideos (search filters).


C. req.body (The Text Payload)
Where does it come from? The client fills out inputs/form fields (JSON or form-data).
When is it used? Title, description, email, password.
Express parses it: req.body = { title: "My Video", description: "Cool video" }


D. req.file vs req.files (The Files Caught by Multer)

Express cannot read files natively. If a user uploads a video or image, Express will just drop it.

That’s why we use Multer!
Multer catches the incoming bytes, saves them to your local disk (./public/temp), and then attaches:
If single file (upload.single("avatar")): ➔ req.file (an object with .path, .filename, etc.)
If multiple fields (upload.fields(...)): ➔ req.files (an object of arrays, like req.files.videoFile[0].path)


E. req.user (The Badge Pinned by Middleware)
Notice: The browser never sends req.user!
Your security guard, verifyJWT, checks the token. If the token is valid, verifyJWT does:
javascript
req.user = user; // 👈 Middleware pins the logged-in user to the backpack!
next();
That is why inside any controller protected by verifyJWT, you can write req.user._id to know who is doing the action!