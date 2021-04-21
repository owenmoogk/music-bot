from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
from .models import Vote


class AuthURL(APIView):
	def get(self, request, fornat=None):
		scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

		url = Request('GET', 'https://accounts.spotify.com/authorize', params={
			'scope': scopes,
			'response_type': 'code',
			'redirect_uri': REDIRECT_URI,
			'client_id': CLIENT_ID
		}).prepare().url

		return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
	code = request.GET.get('code')
	error = request.GET.get('error')

	response = post('https://accounts.spotify.com/api/token', data={
		'grant_type': 'authorization_code',
		'code': code,
		'redirect_uri': REDIRECT_URI,
		'client_id': CLIENT_ID,
		'client_secret': CLIENT_SECRET
	}).json()

	access_token = response.get('access_token')
	token_type = response.get('token_type')
	refresh_token = response.get('refresh_token')
	expires_in = response.get('expires_in')
	error = response.get('error')

	if not request.session.exists(request.session.session_key):
		request.session.create()

	update_or_create_user_tokens(
		request.session.session_key, access_token, token_type, expires_in, refresh_token)

	return redirect('frontend:')


class IsAuthenticated(APIView):
	def get(self, request, format=None):
		is_authenticated = is_spotify_authenticated(
			self.request.session.session_key)
		return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
	def get(self, request, format=None):
		room_code = self.request.session.get('room_code')
		room = Room.objects.filter(code=room_code)
		if room.exists():
			room = room[0]
		else:
			return Response({}, status=status.HTTP_404_NOT_FOUND)
		host = room.host
		endpoint = "player/currently-playing"
		response = execute_spotify_api_request(host, endpoint)

		if 'error' in response or 'item' not in response:
			return Response({}, status=status.HTTP_204_NO_CONTENT)

		item = response.get('item')
		duration = item.get('duration_ms')
		progress = response.get('progress_ms')
		album_cover = item.get('album').get('images')[0].get('url')
		is_playing = response.get('is_playing')
		song_id = item.get('id')

		artist_string = ""

		votes = len(Vote.objects.filter(room=room, song_id = song_id))

		for i, artist in enumerate(item.get('artists')):
			if i > 0:
				artist_string += ", "
			name = artist.get('name')
			artist_string += name

		song = {
			'title': item.get('name'),
			'artist': artist_string,
			'duration': duration,
			'time': progress,
			'image_url': album_cover,
			'is_playing': is_playing,
			'votes': votes,
			"votes_required": room.votes_to_skip,
			'id': song_id
		}

		self.update_room_song(room, song_id)

		return Response(song, status=status.HTTP_200_OK)

	def update_room_song(self, room, song_id):
		current_song = room.current_song

		if current_song != song_id:
			room.current_song = song_id
			room.save()

			# remove all the votes (for the current room)
			votes = Vote.objects.filter(room = room)
			votes.delete()

class PauseSong(APIView):
	def put(self, response, format=None):
		room_code = self.request.session.get('room_code')
		room = Room.objects.filter(code=room_code)[0]
		if self.request.session.session_key == room.host or room.guest_can_pause:
			pause_song(room.host)
			return Response({}, status=status.HTTP_204_NO_CONTENT)
		
		return Response({}, status=status.HTTP_403_FORBIDDEN)
	
class PlaySong(APIView):
	def put(self, response, format=None):
		room_code = self.request.session.get('room_code')
		room = Room.objects.filter(code=room_code)[0]
		if self.request.session.session_key == room.host or room.guest_can_pause:
			play_song(room.host)
			return Response({}, status=status.HTTP_204_NO_CONTENT)
		
		return Response({}, status=status.HTTP_403_FORBIDDEN)

class SkipSong(APIView):
	def post(self, request, format=None):
		room_code = self.request.session.get('room_code')
		room = Room.objects.filter(code=room_code)

		if room.exists():
			room = room[0]
		else:
			return Response({'Error': 'Room does not exist'}, status=status.HTTP_404_NOT_FOUND)

		# if the user is the host just skip it boiiiiiii
		if self.request.session.session_key == room.host:
			skip_song(room.host)
		else:
			personVote = Vote.objects.filter(room=room, song_id = room.current_song, user = request.session.session_key)
			if not personVote.exists():
				vote = Vote(user = self.request.session.session_key, room=room, song_id=room.current_song)
				vote.save()
				skipIfNeeded(room)
			else:
				personVote = personVote[0]		
				personVote.delete()

		return Response({}, status.HTTP_204_NO_CONTENT)

def skipIfNeeded(room):
	# check if the song needs to be skipped
	votes = Vote.objects.filter(room=room, song_id = room.current_song)
	votes_needed = room.votes_to_skip
	if len(votes) >= votes_needed:
		# delete all the votes
		votes.delete()
		skip_song(room.host)

# you can only go back if you are the host. Thats it. suck it up.
class PrevSong(APIView):
	def post(self, request, format=None):
		room_code = self.request.session.get('room_code')
		room = Room.objects.filter(code=room_code)

		if room.exists():
			room = room[0]
		else:
			return Response({'Error': 'Room does not exist'}, status=status.HTTP_404_NOT_FOUND)

		if self.request.session.session_key == room.host:
			prev_song(room.host)

		return Response({}, status.HTTP_204_NO_CONTENT)