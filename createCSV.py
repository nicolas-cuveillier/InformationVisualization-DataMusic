import pandas as pd

# read DataFrame
data = pd.read_csv('final.csv')

df = data.iloc[200:300]
df = df[['Genre', 'Album Length', 'Worldwide Sales (Est.)']]

for i in range(200, 300):
    album_length = float(df.loc[i]['Album Length'])
    worldwide_sales = float((df.loc[i]['Worldwide Sales (Est.)']).replace(',', ''))

    if album_length < 40:
        df.loc[i, 'Album Length'] = '<40'
    elif album_length < 60:
        df.loc[i, 'Album Length'] = '40-60'
    elif album_length < 80:
        df.loc[i, 'Album Length'] = '60-80'
    else:
        df.loc[i, 'Album Length'] = '>80'

    if worldwide_sales >= 20000000:
        df.loc[i, 'Worldwide Sales (Est.)'] = '>20,000,000'
    elif worldwide_sales >= 15000000:
        df.loc[i, 'Worldwide Sales (Est.)'] = '15,000,000-20,000,000'
    elif worldwide_sales >= 10000000:
        df.loc[i, 'Worldwide Sales (Est.)'] = '10,000,000-15,000,000'
    elif worldwide_sales >= 5000000:
        df.loc[i, 'Worldwide Sales (Est.)'] = '5,000,000-10,000,000'
    else:
        df.loc[i, 'Worldwide Sales (Est.)'] = '<5,000,000'
    
    df.loc[i, 'row'] = str(i)

df.to_csv(f'sankey_data_10s.csv', index=False)

sankey_data = pd.read_csv('sankey_data_10s.csv')
print(sankey_data)

df_1 = sankey_data[['Genre', 'Album Length', 'row']]
df_2 = sankey_data[['Album Length', 'Worldwide Sales (Est.)', 'row']]

df_1.rename(columns={'Genre': 'source'}, inplace=True)
df_1.rename(columns={'Album Length': 'target'}, inplace=True)
df_1['value'] = 1

df_2.rename(columns={'Album Length': 'source'}, inplace=True)
df_2.rename(columns={'Worldwide Sales (Est.)': 'target'}, inplace=True)
df_2['value'] = 1

pd.concat([df_1, df_2]).to_csv(f'sankey_chart_10s.csv', index=False)

sankey = pd.read_csv('sankey_chart_10s.csv')

sorted = sankey.pivot_table(columns=['source', 'target'], aggfunc={'value': 'size'}).transpose()
sorted.to_csv(f'sankey_sorted_10s.csv', index=True)