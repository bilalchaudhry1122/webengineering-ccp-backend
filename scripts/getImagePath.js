/**
 * Helper function to get image path based on product name
 * Maps product names to image filenames
 */

function getImagePath(productName) {
  const imageMap = {
    'apple': '/images/Appl2.jfif',
    'banana': '/images/Banana.jfif',
    'orange': '/images/Orange.jfif',
    'mango': '/images/mangos.jfif',
    'grapes': '/images/Grapes.jfif',
    'watermelon': '/images/water melon.jfif',
    'pineapple': '/images/images.jfif', // Using generic image placeholder since pineapple.jfif is missing
    'strawberry': '/images/strawbery.jfif',
    'kiwi': '/images/kiwi.jfif',
    'papaya': '/images/papaya.jfif'
  };

  const normalizedName = productName.toLowerCase().trim();
  return imageMap[normalizedName] || '/images/images.jfif';
}

module.exports = { getImagePath };

