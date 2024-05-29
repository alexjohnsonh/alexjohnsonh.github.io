document.addEventListener('DOMContentLoaded', function() {
    var rightSection = document.getElementById('right-section');
  
    function setRightSectionHeight() {
      var windowHeight = window.innerHeight;
      rightSection.style.height = windowHeight + 'px';
    }
  
    setRightSectionHeight();
    window.addEventListener('resize', setRightSectionHeight);
  });