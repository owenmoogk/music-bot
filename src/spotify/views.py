from django.shortcuts import render, redirect
from .credentials import redirectUri, clientID, clientSecret
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import updateOrCreateUserTokens, isSpotifyAuthenticated

class AuthURL(APIView):
	def get(self, request, format=None):
		
		# from spotify developer documentation
		scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

		# this is a url that we can go to to login the user
		url = Request("GET", 'https://accounts.spotify.com/authorize', params = {
			'scope': scopes,
			'response_type': 'code',
			"redirect_uri": redirectUri,
			'client_id': clientID,
		}).prepare().url

		return Response({"url": url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
	code = request.GET.get('code')
	error = request.GET.get('error')

	response = post('https://accounts.spotify.com/api/token', data = {
		'grant_type': 'authorization_code',
		'code': code,
		'redirect_uri': redirectUri,
		'client_id': clientID,
		'client_secret': clientSecret,
	}).json()

	access_token = response.get('access_token')
	token_type = response.get('token_type')
	refresh_token = response.get('refresh_token')
	expires_in = response.get('expires_in')
	error = response.get('error')

	if not request.session.exists(request.session.session_key):
		request.session.create()

	updateOrCreateUserTokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

	return redirect('frontend:')

class isAuthenticated(APIView):
	def get(self, request, format=None):
		isAuthenticated = isSpotifyAuthenticated(self.request.session.session_key)
		return Response({'status': isAuthenticated}, status=status.HTTP_200_OK)