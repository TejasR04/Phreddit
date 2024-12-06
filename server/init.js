// /* server/init.JSON
// ** You must write a script that will create documents in your database according
// ** to the datamodel you have defined for the application.  Remember that you 
// ** must at least initialize an admin user account whose credentials are derived
// ** from command-line arguments passed to this script. But, you should also add
// ** some communities, posts, comments, and link-flairs to fill your application
// ** some initial content.  You can use the initializeDB.js script as inspiration, 
// ** but you cannot just copy and paste it--you script has to do more to handle
// ** users.
// */


const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/users');
const Post = require('./models/posts');
const Community = require('./models/communities'); // Import the Community model
const Comment = require('./models/comments'); // Import the Comment model
const LinkFlair = require('./models/linkflairs'); // Import the LinkFlair model

// MongoDB Connection
mongoose
  .connect('mongodb://127.0.0.1:27017/phreddit', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('Connected to MongoDB');

    try {
      // Clear existing data
      await User.deleteMany();
      await Post.deleteMany();
      await Community.deleteMany();

      console.log('Cleared existing data.');
      //Admin email
      const adminEmail = process.argv[2];
        if (!adminEmail) {
            console.error('Please provide an admin email as a command-line argument');
            process.exit(1);
        }

      //Admin display name
      const adminDisplayName = process.argv[3];
        if (!adminDisplayName) {
            console.error('Please provide an admin display name as a command-line argument');
            process.exit(1);
        }

      // Admin password
      const adminPassword = process.argv[4];
      if (!adminPassword) {
        console.error('Please provide an admin password as a command-line argument');
        process.exit(1);
      }

      //If there aren't 3 arguments, exit
        if (process.argv.length != 5) {
            console.error('Please provide an admin email, display name, and password.');
            process.exit(1);
        }

      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: adminEmail,
        displayName: adminDisplayName,
        password: adminPassword,
        reputation: 1000,
        createdDate: new Date('September 1, 2004 12:00:00'),
        postIDs: [],
        commentIDs: [],
        communityIDs: [],
      });

      await adminUser.save();
      console.log('Admin user created successfully.');

      // Create Mock Users
      const user1 = new User({
        firstName: 'LeBron',
        lastName: 'The Viking',
        email: 'rollo@phreddit.com',
        password: 'password',
        createdDate: new Date('August 23, 2024 08:00:00'),
        reputation: 100,
        displayName: 'rollo',
        postIDs: [],
        commentIDs: [],
        communityIDs: [],
      });

      const user2 = new User({
        firstName: 'Shemp',
        lastName: 'The Wise',
        email: 'user2@phreddit.com',
        password: 'password',
        createdDate: new Date('August 23, 2024 08:00:00'),
        reputation: 100,
        displayName: 'shemp',
        postIDs: [],
        commentIDs: [],
        communityIDs: [],
      });

      await Promise.all([user1.save(), user2.save()]);
      console.log('Mock users created.');

      // Create Mock Communities
      const community1 = new Community({
        name: 'p/all',
        description: 'A community for general discussions.',
        creator: ' ',
        members: [], // Pre-populate members
        postIDs: [], // Pre-populate posts
        startDate: new Date('August 10, 2014 04:18:00'),
      });

      const community2 = new Community({
        name: 'p/technology',
        description: 'A community for tech nerds.',
        creator: ' ',
        members: [], // Pre-populate members
        postIDs: [], // Pre-populate posts
        startDate: new Date('May 4, 2017 08:32:00'),
      });

      const community3 = new Community({
        name: 'p/JavaScript',
        description: 'A place to discuss JavaScript.',
        creator: ' ',
        members: [],
        postIDs: [],
        startDate: new Date('June 15, 2019 10:00:00'),
      });

      await Promise.all([community1.save(), community2.save(), community3.save()]);
      console.log('Mock communities created.');

      // Create Mock Posts
      const post1 = new Post({
        title: 'AITJ for parking my Cybertruck?',
        content: 'I parked my Cybertruck in a handicapped spot to protect it. Am I the jerk?',
        postedBy: '',
        postedDate: new Date('August 23, 2024 01:19:00'),
        views: 14,
        linkFlairID: [], // No link flair
        commentIDs: [], // Pre-populate comments
        upvotes: 5,
      });

      const post2 = new Post({
        title: 'Remember when History Channel showed history?',
        content:
          'Does anyone else remember when History Channel actually showed history instead of alien shows?',
        postedBy: '',
        postedDate: new Date('September 9, 2024 14:24:00'),
        views: 1030,
        linkFlairID: [], 
        commentIDs: [],
        upvotes: 0,
      });

      const post3 = new Post({
        title: 'React Hooks vs. Class Components',
        content: 'Which one do you prefer and why?',
        postedBy: '',
        postedDate: new Date('June 20, 2024 09:00:00'),
        views: 400,
        linkFlairID: [],
        commentIDs: [],
        upvotes: 20,
      });

      const post4 = new Post({
        title: 'AI Generated Art',
        content: 'Check out this AI-generated art piece. What do you think?',
        postedBy: '',
        postedDate: new Date('June 25, 2024 10:00:00'),
        views: 200,
        linkFlairID: [],
        commentIDs: [],
        upvotes: 12,
      });

      await Promise.all([post1.save(), post2.save(), post3.save(), post4.save()]);
      console.log('Mock posts created.');

      //Make comments
        const comment1 = new Comment({
            content: 'There is no higher calling than the protection of Tesla products. God bless you sir and God bless Elon Musk. Oh, NTJ.',
            commentedBy: '',
            commentedDate: new Date('August 23, 2024 08:22:00'),
            commentIDs: [],
            upvotes: 3,
        });
        const comment2 = new Comment({
            content: 'Obvious rage bait, but if not, then you are absolutely the jerk in this situation. Please delete your Tron vehicle and leave us in peace. YTJ.',
            commentedBy: '',
            commentedDate: new Date('August 23, 2024 10:57:00'),
            commentIDs: [],
            upvotes: 8,
        });
        await Promise.all([comment1.save(), comment2.save()]);
        console.log('Mock comments created.');

      //Push postIDs to user1 and user2
        user1.postIDs.push(post1._id, post3._id);
        user2.postIDs.push(post2._id, post4._id);
        await Promise.all([user1.save(), user2.save()]);
        console.log('Added postIDs to users.');

      //Push communityIDs to user1 and user2
        adminUser.communityIDs.push(community1._id, community2._id, community3._id);
        user1.communityIDs.push(community1._id, community3._id);
        user2.communityIDs.push(community1._id, community2._id);
        await Promise.all([user1.save(), user2.save()]);
        console.log('Added communityIDs to users.');
      //Push postIDs to community1 and community2
        community1.postIDs.push(post1._id, post2._id);
        community2.postIDs.push(post4._id);
        community3.postIDs.push(post3._id);
        await Promise.all([community1.save(), community2.save(), community3.save()]);
        console.log('Added postIDs to communities.');  
      //Push members to community 1, community 2, and community 3
        community1.members.push(adminUser.displayName,user1.displayName, user2.displayName);
        community2.members.push(adminUser.displayName,user2.displayName);
        community3.members.push(adminUser.displayName,user1.displayName);
        await Promise.all([community1.save(), community2.save(), community3.save()]);
        console.log('Added members to communities.');
      //Push creator to community1, community2, and community3
        community1.creator = adminUser.displayName;
        community2.creator = user2.displayName;
        community3.creator = user1.displayName;
        await Promise.all([community1.save(), community2.save(), community3.save()]);
        console.log('Added creators to communities.');

      //Push postedBy to posts
        post1.postedBy = user1.displayName;
        post2.postedBy = user2.displayName;
        post3.postedBy = user1.displayName;
        post4.postedBy = user2.displayName;
        await Promise.all([post1.save(), post2.save(), post3.save(), post4.save()]);
        console.log('Added postedBy to posts.');
      //Push commentIDs to posts
      post1.commentIDs.push(comment1._id);
      comment1.commentIDs.push(comment2._id);
      comment1.commentedBy = user2.displayName;
      comment2.commentedBy = user1.displayName;
        await Promise.all([post1.save(), comment1.save(), comment2.save()]);
        console.log('Added commentIDs to posts.');


        //Make link flairs
        const linkFlair1 = new LinkFlair({
            content: 'The jerkstore called...',
        });
        //Push link flair to post
        post1.linkFlairID.push(linkFlair1._id);
        await Promise.all([linkFlair1.save(), post1.save()]);
        console.log('Added link flair to post.');
        


      console.log('Database initialized successfully.');
      process.exit(0);
    } catch (error) {
      console.error('Error initializing database:', error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
