from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from .credentials import clientID, clientSecret
from requests import post


def getUserToken(session_id):
	user_tokens = SpotifyToken.objects.filter(user = session_id)
	if user_tokens.exists():
		return(user_tokens[0])
	return None

def updateOrCreateUserTokens(session_id, access_token, token_type, expires_in, refresh_token):
	tokens = getUserToken(session_id)
	expires_in = timezone.now() + timedelta(seconds = expires_in)

	if tokens:
		tokens.access_token = access_token
		tokens.refresh_token = refresh_token
		tokens.expires_in = expires_in
		tokens.token_type = token_type
		tokens.save()
	else:
		tokens = SpotifyToken(user = session_id, access_token = access_token, refresh_token = refresh_token, token_type = token_type, expires_in = expires_in)
		tokens.save()

def isSpotifyAuthenticated(session_id):
	tokens = getUserToken(session_id)
	if tokens:
		expiry = tokens.expires_in
		if expiry <= timezone.now():
			refreshSpotifyTokens(session_id)
		return True
	return False

def refreshSpotifyTokens(session_id):
	refresh_token = getUserToken(session_id).refresh_token

	response = post('https://accounts.spotify.com/api/token', data={
		'grant_type': 'refresh_token',
		'refresh_token': refresh_token,
		'client_id': clientID,
		'client_secret': clientSecret,
	}).json()

	access_token = response.get('access_token')
	token_type = response.get('token_type')
	expires_in = response.get('expires_in')
	refresh_token = response.get('refresh_token')

	updateOrCreateUserTokens(session_id, access_token, token_type, expires_in, refresh_token)