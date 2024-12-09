import React from 'react';
import { render, screen } from '@testing-library/react';
//Impore the UserContext from client/src/utils/userContext.js
import UserContext from 'client/src/utils/userContext';
import Banner from 'client/src/components/banner';  // Adjust the path if necessary

test('Create Post button is disabled for guest users', () => {
  const { getByText } = render(
      <UserContext.Provider value={{ user: null }}>
          <Banner onSearch={() => {}} onCreatePost={() => {}} onWelcomeClick={() => {}} />
      </UserContext.Provider>
  );
  const createPostButton = getByText(/Create Post/i);
  expect(createPostButton).toHaveAttribute('disabled');
});

test('Create Post button is enabled for registered users', () => {
  const { getByText } = render(
      <UserContext.Provider value={{ user: { name: 'John' } }}>
          <Banner onSearch={() => {}} onCreatePost={() => {}} onWelcomeClick={() => {}} />
      </UserContext.Provider>
  );
  const createPostButton = getByText(/Create Post/i);
  expect(createPostButton).not.toHaveAttribute('disabled');
});

