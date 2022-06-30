from django.shortcuts import render
from rest_framework import generics,status
from .models import Room
from .serializers import RoomSerializer,CreateRoomSerializer,UpdateRoomSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'
    
    def get(self,request,format=None):
        code = request.GET.get(self.lookup_url_kwarg)#GET CODE FROM URL

        if code !=None:
            room = Room.objects.filter(code = code)
            if len(room)>0:
                data = RoomSerializer(room[0]).data #SEND THE INFO ABOUT THE ROOM TO FRONTEND
                data['is_host'] = self.request.session.session_key == room[0].host

                return Response(data, status=status.HTTP_200_OK)
            return Response({'Bad Request': 'No room has this code'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self,request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()#IF THE USER HASN'T JOINED BEFORE, CREATE A SESSION FOR HIM
        code = request.data.get(self.lookup_url_kwarg)#GET THE CODE FROM THE FRONTEND
        if code!=None:
            room_result = Room.objects.filter(code = code)
            if room_result.exists():
                room = room_result[0]
                self.request.session['room_code'] = code
                return Response({"Message":"Room joined"},status=status.HTTP_200_OK)
            return Response({"Bad request":"Invalid Room Code"},status=status.HTTP_400_BAD_REQUEST)
        return Response({"Bad request":"Invalid Post Data"},status=status.HTTP_400_BAD_REQUEST)
            



class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')#GET THE DATA FROM THE FRONTEND
            votes_to_skip = serializer.data.get('votes_to_skip')#GET THE DATA FROM THE FRONTEND
            host = self.request.session.session_key#GET THE HOST FROM THE SESSION
            queryset = Room.objects.filter(host=host)
            if queryset.exists():#IF THE ROOM EXIST THEN JUST UPDATE ITS STATS
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            else:#IF IT DOESN'T EXIST THEN CREATE A NEW ONE
                room = Room(host=host, guest_can_pause=guest_can_pause,
                            votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class UserInRoom(APIView):

    def get(self,request):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        data = {
            'code':self.request.session.get('room_code')
        }#GET THE ROOM THE USER IS IN

        return JsonResponse(data,status=status.HTTP_200_OK)

class LeaveRoom(APIView):
    def post(self,request):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')#REMOVE THE ROOM CODE FROM THE SESSION
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host = host_id)
            if len(room_results)>0:
                room = room_results[0]
                room.delete()#IF THE USER WHO LEAVES THE ROOM IS THE HOST THEN THE ROOM IS DELETED
        return Response({"Message":"Success"},status=status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'msg': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': 'You are not the host of this room.'}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST)


        
                






    
