import React, { useState, useEffect } from 'react';
import './Home.css';
import './Sidebar.css';
import './Layout.css';

const HomePage = ({ loggedInUserId }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/searchEntries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ search: '' }), 
        });
        if (!response.ok) {
          throw new Error(`HTTP error. Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched posts:", data);
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const redirectToView = (id) => {
    const path = `/getEntry/${id}?from=home`;
    window.location.href = path;
  };

  return (
    <div className="pin-container">
      {posts.map((post) => (
        <div className="card card-medium" key={post._id}>
          <div className='post-top-row'>
            <div className="profile-details">
              <img className="user-picture" src={post.userPicture || 'https://via.placeholder.com/50'} alt="User" />
              <div className="username">{post.username || 'Anonymous'}</div>
            </div>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => redirectToView(post._id)}
              id='single-view-btn'
            >
              View
            </button>
          </div>
          <div className="image-row">
            <img className="post-image" src={`http://localhost:5001/${post.image}`} alt={post.title} />
          </div>
          <div className="title-rating">
            <div className="title">{post.title}</div>
            <div className="rating">Rating: {post.rating ? post.rating : 'No rating yet'}</div>
          </div>
          <div className="date">Date: {new Date(post.date).toLocaleDateString()}</div> {/* Display date */}
          <div className="location">
            {post.location && (
              <>
                <div>{post.location.street}</div>
                <div>{post.location.city}</div>
                <div>{post.location.state}</div>
                <div>{post.location.country}</div>
              </>
            )}
          </div>
          <div className="description">{post.description || 'No description available'}</div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;

