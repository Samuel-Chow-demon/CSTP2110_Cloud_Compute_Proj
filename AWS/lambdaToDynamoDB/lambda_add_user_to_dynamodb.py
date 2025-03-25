import json
import boto3
import datetime
from zoneinfo import ZoneInfo

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('cstp2110-cloud-proj-user-table')

# Vancouver Timezone to string
current_pacific_time = datetime.datetime.now(ZoneInfo("America/Vancouver")).isoformat()

def lambda_handler(event, context):

    userId = event.get('userId')
    username = event.get('username')
    user_email = event.get('email')

    item = {
        'userId': userId,
        'username': username,
        'email': user_email,
        'createdAt': current_pacific_time,
        'updatedAt': current_pacific_time
    }

    try:
        table.put_item(Item = item)
        print(f'User {username} saved to DynamoDB, id {userId}')
        return {
            'statusCode': 200,
            'body': json.dumps(item)
        }
    except Exception as e:
        print('Error saving event:', str(e))
        return {
            'statusCode': 500,
            'body': json.dumps({
                item : item,
                'error': str(e)
            })
        }

