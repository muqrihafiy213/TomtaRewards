import React from 'react';
import useUserPoints from './useUserPoints';

const Points = () => {
  const { userPoints, loading } = useUserPoints();

  return (
    <div>
      {loading ? (
        <p>Loading user data...</p>
      ) : (
        <div>
          Pts: {userPoints}
          {/* Include other fields as needed */}
        </div>
      )}
    </div>
  );
};

export default Points;
