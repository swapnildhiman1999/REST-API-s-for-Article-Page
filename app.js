//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {
  useNewUrlParser: true
});

const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("Article", articleSchema);

//TODO
// creating chainable routes to reduce the writing same code
// app.route("/articles").get().post().delete();
app.route("/articles")

  .get(function(req, res) {
    // finding all the documents in collection
    Article.find(function(err, foundArticles) {
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
      //console.log(foundArticles);
    });
  })

  .post(function(req, res) {
    // console.log(req.body.title);
    // console.log(req.body.content);
    //using postman to test this
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    newArticle.save(function(err) {
      if (!err) {
        res.send("Successfully added a new article");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) {
    // Deleting all the documents
    Article.deleteMany({}, function(err) {
      if (!err) {
        res.send("Deleted all the articles/documents");
      } else {
        res.send(err);
      }
    })
  });
/////////////////////////////////////////////////////////////////

// request targeting  for particular article
app.route("/articles/:articleTitle")
  .get(function(req, res) {
    const titleName = req.params.articleTitle;
    Article.findOne({
      title: titleName
    }, function(err, foundArticle) {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No article matching was found");
      }
    });
  })
  // update all the values to the one we are putting
  .put(function(req,res){
    Article.replaceOne(
      //adding condition
      {title:req.params.articleTitle},
      //update kya krrna chahte ho
      {title:req.body.title,content:req.body.content},
      //taaki poora document he replace ho jaaye toh jo hummne provide kiya hai usse
      {overwrite:true},
      function(err){
        if(!err){
          res.send("Successfully update the article.");
        }
      }
    )
  })
  // if we don't want to update the entire document but specific fields jiski field provide krri hai
  .patch(function(req,res){
      Article.updateOne(
          {title:req.params.articleTitle},
          //kaun kaun si field update krrni hai bss ,poora document reset nahi hoga
          {$set: req.body},
          function(err){
            if(!err){
              res.send("Successfully working patch");
            }else{
                res.send(err);
            }
          });
  })
  .delete(function(req,res){
      Article.deleteOne({title:req.params.articleTitle},function(err){
        if(!err){
          res.send("Successfully deleted the specific article");
        }else{
          res.send(err);
        }
      })
  });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
